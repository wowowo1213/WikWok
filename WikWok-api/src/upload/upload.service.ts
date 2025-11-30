import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Video } from './video.model';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Video.name) private videoModel: Model<Video>
  ) {}

  async checkUploadStatus(hash: string) {
    const tempDir = join(__dirname, '..', '..', 'uploads', 'temp');
    const finalDir = join(__dirname, '..', '..', 'uploads', 'videos');
    const finalFilename = `${hash}.mp4`;
    const finalPath = join(finalDir, finalFilename);

    if (existsSync(finalPath)) return { exist: true };

    if (!existsSync(tempDir)) return { exist: false };

    const chunks = await fs.readdir(tempDir);
    const uploadedChunks = chunks
      .filter(filename => filename.startsWith(`${hash}-`))
      .map(filename => parseInt(filename.split('-')[1]));

    return { exist: false, uploadedChunks };
  }

  async mergeChunks(
    userId: string,
    fileHash: string,
    filename: string,
    caption: string,
    chunkCount: number
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('用户不存在');

    const tempDir = join(__dirname, '..', '..', 'uploads', 'temp');
    const finalDir = join(__dirname, '..', '..', 'uploads', 'videos');

    if (!existsSync(finalDir)) mkdirSync(finalDir, { recursive: true });

    const finalFilename = `${fileHash}.mp4`;
    const finalPath = join(finalDir, finalFilename);
    const writeStream = createWriteStream(finalPath);

    try {
      for (let i = 0; i < chunkCount; i++) {
        const chunkFilename = `${fileHash}-${i}`;
        const chunkPath = join(tempDir, chunkFilename);

        if (!existsSync(chunkPath)) throw new BadRequestException(`缺少分片 ${i}`);

        const chunkData = await fs.readFile(chunkPath);
        writeStream.write(chunkData);
      }

      writeStream.end();

      await new Promise((resolve, reject) => {
        // writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      await this.cleanTempChunks(fileHash, chunkCount, tempDir);

      const videoUrl = `/uploads/videos/${finalFilename}`;
      const newVideo = new this.videoModel({
        userId: user._id,
        fileHash,
        videoUrl,
        caption,
        filename,
      });

      const savedVideo = await newVideo.save();
      await this.userModel.updateOne({ _id: user._id }, { $push: { videos: savedVideo._id } });

      return {
        videoUrl,
        caption,
        filename,
      };
    } catch (error) {
      writeStream.destroy();
      await fs.unlink(finalPath).catch(() => {});
      await this.cleanTempChunks(fileHash, chunkCount, tempDir);
      throw new BadRequestException(error.message || '合并分片失败');
    }
  }

  async submitMeta(
    userId: string,
    fileHash: string,
    filename: string,
    caption: string,
    views?: number,
    likes?: number
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('用户不存在');

    const finalDir = join(__dirname, '..', '..', 'uploads', 'videos');
    const finalFilename = `${fileHash}.mp4`;
    const finalPath = join(finalDir, finalFilename);

    if (!existsSync(finalPath)) throw new BadRequestException('文件不存在');

    const videoUrl = `/uploads/videos/${finalFilename}`;

    const existingVideo = await this.videoModel.findOne({ fileHash, userId });
    if (existingVideo) {
      return {
        videoUrl: existingVideo.videoUrl,
        caption: existingVideo.caption,
        filename: existingVideo.filename,
        message: '视频已存在',
      };
    }

    const newVideo = new this.videoModel({
      userId: user._id,
      videoUrl,
      caption,
      originalFilename: filename,
      fileHash,
      views: views || 0,
      likes: likes || 0,
    });

    const savedVideo = await newVideo.save();
    await this.userModel.updateOne({ _id: user._id }, { $push: { videos: savedVideo._id } });

    return {
      videoUrl,
      caption,
      filename,
    };
  }

  private async cleanTempChunks(fileHash: string, chunkCount: number, tempDir: string) {
    for (let i = 0; i < chunkCount; i++) {
      const chunkFilename = `${fileHash}-${i}`;
      const chunkPath = join(tempDir, chunkFilename);

      if (existsSync(chunkPath)) {
        await fs.unlink(chunkPath).catch(err => {
          console.error(`删除临时分片 ${chunkFilename} 失败:`, err);
        });
      }
    }
  }
}
