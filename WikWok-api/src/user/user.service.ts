import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './schemas/video.model';
import { User } from './schemas/user.schema';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto/userinfo.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Video.name) private videoModel: Model<Video>
  ) {}

  async registerUser(registerDto: RegisterUserDto) {
    const defaultAvatarPath = join(process.cwd(), 'public/images/default-avatar.jpg');
    const imageBuffer = readFileSync(defaultAvatarPath);

    const {
      phoneNumber,
      username,
      password,
      confirmPassword,
      bio = '这个人很懒，什么都没有留下~',
      avatar = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
    } = registerDto;

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
    });

    await newUser.save();
    return {
      id: newUser._id,
    };
  }

  async loginUser(loginDto: LoginUserDto) {
    const { phoneNumber, password } = loginDto;

    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) throw new BadRequestException('用户不存在，请先注册');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('密码错误');

    return {
      id: user._id,
    };
  }

  async getUserinfo(id: string) {
    const query = { _id: id };
    const user = await this.userModel.findOne(query).select('username bio avatar');
    if (!user) throw new BadRequestException('用户不存在，请先注册');
    return {
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
    };
  }

  async updateUser(updateDto: UpdateUserDto) {
    const { id, username, bio, avatar } = updateDto;
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: id },
      { username, bio, avatar },
      { new: true }
    );
    if (!updatedUser) throw new BadRequestException('用户更新失败');
    return {
      username: updatedUser.username,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    };
  }

  async uploadVideo(payload: { id: string; text: string; file: Express.Multer.File }) {
    const { id, text, file } = payload;

    try {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        if (file && file.path) {
          try {
            unlinkSync(file.path);
          } catch (e) {
            console.error('删除临时文件失败:', e);
          }
        }
        throw new BadRequestException('用户不存在');
      }

      const videoUrl = `/uploads/videos/${file.filename}`;
      const newVideo = new this.videoModel({
        userId: user._id,
        videoUrl,
        text,
      });
      const savedVideo = await newVideo.save();
      await this.userModel.updateOne({ _id: user._id }, { $push: { videos: savedVideo._id } });
      return savedVideo;
    } catch (error) {
      if (file && file.path) {
        try {
          unlinkSync(file.path);
        } catch (e) {
          console.error('删除临时文件失败:', e);
        }
      }
      throw new BadRequestException(error.message || '视频上传失败');
    }
  }
}
