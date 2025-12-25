import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types, PipelineStage, isValidObjectId } from 'mongoose';
import { User } from './user.schema';
import { Video } from 'src/upload/video.model';
import { Comment } from 'src/upload/comment.model';
import { UpdateUserDto } from './userinfo.dto';
import { RegisterUserDto, LoginUserDto } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const defaultAvatarPath = join(process.cwd(), 'public/images/default-avatar.webp');
    const imageBuffer = readFileSync(defaultAvatarPath);
    const processedBuffer = await sharp(imageBuffer).resize(200, 200).toFormat('jpeg').toBuffer();

    const uploadDir = join(__dirname, '..', '..', 'uploads', 'avatars');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `default-${Date.now()}.jpg`;
    const filepath = join(uploadDir, filename);
    await writeFileSync(filepath, processedBuffer);

    const {
      phoneNumber,
      username,
      password,
      confirmPassword,
      bio = '这个人很懒，什么都没有留下~',
      avatarUrl = `/uploads/avatars/${filename}`,
      followers = 0,
      followings = 0,
    } = registerUserDto;

    if (password !== confirmPassword) throw new BadRequestException('两次输入的密码不一致');

    const user = await this.userModel.findOne({ phoneNumber });
    if (user) throw new BadRequestException('该手机号已注册');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      phoneNumber,
      username,
      password: hashedPassword,
      bio,
      avatarUrl,
      followers,
      followings,
    });

    await newUser.save();

    return { user: newUser };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { phoneNumber, password } = loginUserDto;

    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) throw new BadRequestException('用户不存在，请先注册');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('密码错误');

    return { user };
  }

  async getUserInfo(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('username bio avatarUrl followers followings videos followingUsers')
      .populate({
        path: 'videos',
        model: 'Video',
        select: '_id videoUrl caption filename likes views updatedAt userId',
        options: { sort: { updatedAt: -1 } },
        populate: {
          path: 'userId',
          model: 'User',
          select: '_id username avatarUrl',
        },
      });

    if (!user) throw new BadRequestException('用户不存在');

    const videos = user.videos.map(video => ({
      videoId: video._id.toString(),
      videoUrl: video.videoUrl,
      caption: video.caption,
      filename: video.filename,
      likes: video.likes,
      views: video.views,
      updatedAt: video.updatedAt.toISOString(),
      isFollowing: null,
      user: {
        userId: video.userId._id.toString(),
        username: video.userId.username,
        avatarUrl: video.userId.avatarUrl,
      },
      comments: [],
    }));

    return {
      userId: user._id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      followings: user.followings,
      videos,
    };
  }

  async updateUserInfo(updateDto: UpdateUserDto) {
    const { userId, username, bio, image, height, width, top, left } = updateDto;

    let avatarUrl;
    if (image) {
      try {
        const uploadDir = join(__dirname, '..', '..', 'uploads', 'avatars');
        if (!existsSync(uploadDir)) {
          await mkdirSync(uploadDir, { recursive: true });
        }

        const imageBuffer = await sharp(image.buffer)
          .extract({
            left: Number(left),
            top: Number(top),
            width: Number(width),
            height: Number(height),
          })
          .resize(200, 200)
          .toFormat('jpeg')
          .toBuffer();

        const filename = `${userId}-${Date.now()}.jpg`;
        const filepath = join(uploadDir, filename);

        await writeFileSync(filepath, imageBuffer);

        avatarUrl = `/uploads/avatars/${filename}`;
      } catch (error) {
        throw new BadRequestException('头像处理失败');
      }
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { username, bio, avatarUrl },
      { new: true }
    );

    if (!updatedUser) throw new BadRequestException('用户更新失败');
  }

  async getSuggestedUsers(userId: string | undefined) {
    const query: FilterQuery<any> = {};

    if (userId && isValidObjectId(userId)) {
      query._id = { $ne: userId };

      const currentUser = await this.userModel.findById(userId).select('followingUsers').lean();

      const followingIds = currentUser?.followingUsers || [];
      if (followingIds.length > 0) {
        query._id.$nin = followingIds;
      }
    } else {
      query._id = { $ne: null };
    }

    const suggestedUsers = await this.userModel
      .find(query)
      .select('username bio avatarUrl followers followings')
      .limit(10)
      .lean();

    return suggestedUsers.map(user => ({
      userId: user._id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      followings: user.followings,
      isFollowing: false,
    }));
  }

  async getFollowingUsers(userId: string) {
    const currentUser = await this.userModel.findById(userId).populate({
      path: 'followingUsers',
      model: 'User',
      select: 'username bio avatarUrl followers followings',
    });

    if (!currentUser) throw new BadRequestException('用户不存在');

    return currentUser.followingUsers.map(user => ({
      userId: user._id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      followings: user.followings,
      isFollowing: true,
    }));
  }

  async getSuggestedVideos(userId?: string) {
    let followingUserIds: Types.ObjectId[] = [];
    if (userId) {
      const user = await this.userModel.findById(userId).select('followingUsers').lean();
      if (user) followingUserIds = user.followingUsers.map(id => new Types.ObjectId(id));
    }

    const baseQuery = {};

    const pipeline: PipelineStage[] = [
      { $match: baseQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
    ];

    if (followingUserIds?.length > 0) {
      pipeline.push(
        { $match: { userId: { $in: followingUserIds } } },
        { $sort: { likes: -1 } },
        { $limit: 10 }
      );
    } else {
      pipeline.push({ $sort: { likes: -1 } }, { $limit: 10 });
    }

    pipeline.push({
      $project: {
        videoId: '$_id',
        _id: 0,
        videoUrl: 1,
        caption: 1,
        filename: 1,
        likes: 1,
        views: 1,
        updatedAt: 1,
        commentIds: {
          $ifNull: ['$comments', { $ifNull: ['$commentIds', []] }],
        },
        user: {
          userId: '$userInfo._id',
          username: '$userInfo.username',
          avatarUrl: '$userInfo.avatarUrl',
        },
        isFollowing: {
          $cond: {
            if: userId,
            then: { $in: ['$userId', followingUserIds] },
            else: false,
          },
        },
      },
    });

    const videos = await this.videoModel.aggregate(pipeline);

    await Promise.all(
      videos.map(async video => {
        let commentIds = [];
        try {
          commentIds = Array.isArray(video.commentIds)
            ? video.commentIds.map(id => new Types.ObjectId(id))
            : [];
        } catch (e) {
          console.warn('Invalid comment IDs:', video.commentIds);
          commentIds = [];
        }

        if (commentIds.length > 0) {
          const commentsWithUser = await this.commentModel.aggregate([
            { $match: { _id: { $in: commentIds } } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo',
              },
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                text: 1,
                user: {
                  _id: '$userInfo._id',
                  username: '$userInfo.username',
                  avatarUrl: '$userInfo.avatarUrl',
                },
              },
            },
          ]);

          video.comments = commentsWithUser;
        } else {
          video.comments = [];
        }

        delete video.commentIds;
      })
    );

    return videos.map(video => ({
      videoId: video.videoId,
      videoUrl: video.videoUrl,
      caption: video.caption,
      filename: video.filename,
      likes: video.likes,
      views: video.views,
      updatedAt: video.updatedAt.toISOString(),
      isFollowing: video.isFollowing,
      user: video.user,
      comments: video.comments.map(comment => ({
        id: comment._id,
        text: comment.text,
        user: {
          userId: comment.user._id,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      })),
    }));
  }

  async likeVideo(userId: string, videoId: string) {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new BadRequestException('视频不存在');

    const hasLiked = video.likes.some(id => id.toString() === userId);
    if (hasLiked) throw new BadRequestException('已经点赞过');

    video.likes.push(new Types.ObjectId(userId));
    await video.save();
  }

  async unlikeVideo(userId: string, videoId: string) {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new BadRequestException('视频不存在');

    video.likes = video.likes.filter(id => id.toString() !== userId);
    await video.save();
  }

  async addComment(userId: string, videoId: string, text: string) {
    const [video, user] = await Promise.all([
      this.videoModel.findById(videoId),
      this.userModel.findById(userId).select('username avatarUrl'),
    ]);

    if (!video) throw new BadRequestException('视频不存在');
    if (!user) throw new BadRequestException('用户不存在');

    const newComment = new this.commentModel({
      user: userId,
      video: videoId,
      text,
    });

    await newComment.save();

    video.comments.unshift(newComment._id);
    await video.save();

    return {
      id: newComment._id,
      text: newComment.text,
      user: {
        userId: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async deleteComment(userId: string, videoId: string, commentId: string) {
    const [comment, video] = await Promise.all([
      this.commentModel.findById(commentId),
      this.videoModel.findById(videoId),
    ]);

    if (!comment) throw new BadRequestException('评论不存在');
    if (!video) throw new BadRequestException('视频不存在');

    if (comment.video.toString() !== videoId) throw new BadRequestException('评论不属于该视频');

    if (comment.user.toString() !== userId) throw new BadRequestException('没有权限删除评论');

    await comment.deleteOne();

    video.comments = video.comments.filter(id => id.toString() !== commentId);
    await video.save();
  }

  async getVideoById(videoId: string) {
    const video = await this.videoModel
      .findById(videoId)
      .populate('userId', 'username avatarUrl')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatarUrl',
        },
      })
      .select('-__v')
      .lean();

    const populatedVideo = video as unknown as {
      _id: string;
      videoUrl: string;
      filename: string;
      caption: string;
      likes: string[];
      views: string[];
      createdAt: Date;
      updatedAt: Date;
      userId: {
        _id: string;
        username: string;
        avatarUrl: string;
      };
      comments: Array<{
        _id: string;
        text: string;
        user: {
          _id: string;
          username: string;
          avatarUrl: string;
        };
      }>;
    };

    return {
      ...populatedVideo,
      userId: populatedVideo.userId || {
        _id: '',
        username: '匿名用户',
        avatarUrl: '/default-avatar.jpg',
      },
      comments:
        populatedVideo.comments?.map(comment => ({
          ...comment,
          user: comment.user || {
            _id: '',
            username: '匿名用户',
            avatarUrl: '/default-avatar.jpg',
          },
        })) || [],
    };
  }

  async deleteVideo(userId: string, videoId: string) {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new BadRequestException('视频不存在');

    if (video.userId.toString() !== userId) throw new BadRequestException('没有权限删除视频');

    await this.commentModel.deleteMany({ video: videoId });

    await this.userModel.updateOne({ _id: userId }, { $pull: { videos: videoId } });

    await video.deleteOne();
  }
}
