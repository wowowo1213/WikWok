import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Video } from './schemas/video.model';
import { unlinkSync } from 'fs';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Video.name) private videoModel: Model<Video>
  ) {}

  async uploadVideo(payload: { id: string; caption: string; file: Express.Multer.File }) {
    const { id, caption, file } = payload;

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
        caption,
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
