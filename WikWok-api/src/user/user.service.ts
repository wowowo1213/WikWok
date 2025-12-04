import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types, PipelineStage } from 'mongoose';
import { User } from './user.schema';
import { Video } from 'src/upload/video.model';
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
    @InjectModel(Video.name) private videoModel: Model<Video>
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
        select: '_id videoUrl caption filename likes views updatedAt',
        options: { sort: { updatedAt: -1 } },
      });

    if (!user) throw new BadRequestException('用户不存在');

    const videos = user.videos.map(video => ({
      videoId: video._id,
      videoUrl: video.videoUrl,
      caption: video.caption,
      filename: video.filename,
      likes: video.likes,
      views: video.views,
      updatedAt: video.updatedAt,
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
    const query: FilterQuery<any> = { _id: { $ne: userId } };

    if (userId) {
      const currentUser = await this.userModel.findById(userId).select('followingUsers').lean();

      const followingIds = currentUser?.followingUsers || [];
      if (followingIds.length > 0) {
        query._id.$nin = followingIds;
      }
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

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('不能关注自己');
    }

    await this.userModel.findByIdAndUpdate(currentUserId, {
      $addToSet: { followingUsers: targetUserId },
    });

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $inc: { followers: 1 },
    });
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    await this.userModel.findByIdAndUpdate(currentUserId, {
      $pull: { followingUsers: targetUserId },
    });

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $inc: { followers: -1 },
    });
  }

  async getRecommendedVideos(userId?: string) {
    let followingUserIds: Types.ObjectId[] | User[] = [];
    if (userId) {
      const user = await this.userModel.findById(userId).select('followingUsers').lean();
      if (user) {
        followingUserIds = user.followingUsers;
      }
    }

    const baseQuery = {};

    const pipeline: PipelineStage[] = [{ $match: baseQuery }];

    if (followingUserIds?.length > 0) {
      pipeline.push(
        { $match: { userId: { $in: followingUserIds } } },
        { $sort: { likes: -1 } },
        { $limit: 10 }
      );
    } else {
      pipeline.push({ $sort: { likes: -1 } }, { $limit: 10 });
    }

    pipeline.push(
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userInfo' } },
      { $unwind: '$userInfo' },
      {
        $project: {
          videoId: '$_id',
          _id: 0,
          videoUrl: 1,
          filename: 1,
          caption: 1,
          updatedAt: 1,
          likes: 1,
          views: 1,
          user: {
            userId: '$userInfo._id',
            username: '$userInfo.username',
            avatarUrl: '$userInfo.avatarUrl',
          },
          isFollowing:
            followingUserIds?.length > 0 ? { $in: ['$userId', followingUserIds] } : undefined,
        },
      }
    );

    const videos = await this.videoModel.aggregate(pipeline);
    return videos;
  }
}
