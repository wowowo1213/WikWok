import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UpdateUserDto } from './userinfo.dto';
import { RegisterUserDto, LoginUserDto } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const defaultAvatarPath = join(process.cwd(), 'public/images/default-avatar.webp');
    const imageBuffer = readFileSync(defaultAvatarPath);

    const {
      phoneNumber,
      username,
      password,
      confirmPassword,
      bio = '这个人很懒，什么都没有留下~',
      avatar = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
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
      avatar,
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

  async getUserinfo(id: string) {
    const user = await this.userModel
      .findOne({ _id: id })
      .select('username bio avatar followers followings videos')
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
      avatar: user.avatar,
      followers: user.followers,
      followings: user.followings,
      videos,
    };
  }

  async updateUser(updateDto: UpdateUserDto) {
    const { id, username, bio, avatar, followers, followings } = updateDto;

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: id },
      { username, bio, avatar, followers, followings },
      { new: true }
    );

    if (!updatedUser) throw new BadRequestException('用户更新失败');
  }
}
