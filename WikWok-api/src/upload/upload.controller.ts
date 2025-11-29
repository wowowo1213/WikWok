import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(mp4|mov|avi|wmv)$/)) {
          return cb(new Error('只允许上传视频文件'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 1024 * 2,
      },
    })
  )
  async uploadVideo(@UploadedFile() videoFile: Express.Multer.File, @Body() body: any) {
    try {
      const { id, caption } = body;

      if (!id) throw new BadRequestException('视频上传失败，用户未注册');
      if (!caption) throw new BadRequestException('视频上传失败，视频简介不能为空');
      if (!videoFile) throw new BadRequestException('视频不能为空');

      const video = await this.uploadService.uploadVideo({
        id,
        caption,
        file: videoFile,
      });

      return {
        result: {
          videoUrl: video.videoUrl,
          caption: video.caption,
        },
        message: '视频上传成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '视频上传失败');
    }
  }
}
