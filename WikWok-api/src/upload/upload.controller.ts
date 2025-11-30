import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
// import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import * as fs from 'fs/promises';

@Controller('upload')
// @UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 检查文件是否已存在
  @Get('upload-check')
  async checkUploadStatus(@Query('hash') hash: string) {
    if (!hash) {
      throw new BadRequestException('哈希值不能为空');
    }

    return this.uploadService.checkUploadStatus(hash);
  }

  // 上传分片
  @Post('upload-chunk')
  @UseInterceptors(
    FileInterceptor('chunk', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const hash = req.body.hash as string;
          cb(null, hash);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 50, // 限制分片大小50MB
      },
    })
  )
  async uploadChunk(
    @UploadedFiles() file: Express.Multer.File,
    @Body() body: { hash: string; chunkIndex: string; filename: string; chunkCount: string }
  ) {
    const { hash, chunkIndex, filename, chunkCount } = body;

    if (!hash || !chunkIndex || !filename || !chunkCount) {
      if (file?.path) {
        await fs.unlink(file.path).catch(() => {});
      }
      throw new BadRequestException('缺少必要参数');
    }

    // 这里可以添加分片验证逻辑
    return { success: true };
  }

  // 合并分片
  @Post('merge-chunks')
  async mergeChunks(
    @Body()
    body: {
      userId: string;
      fileHash: string;
      filename: string;
      caption: string;
      chunkCount: number;
    }
  ) {
    const { userId, fileHash, filename, caption, chunkCount } = body;

    if (!userId || !fileHash || !filename || !caption || !chunkCount) {
      throw new BadRequestException('缺少必要参数');
    }

    return this.uploadService.mergeChunks(userId, fileHash, filename, caption, chunkCount);
  }

  // 提交文件元数据
  @Post('submit-meta')
  async submitMeta(
    @Body()
    body: {
      userId: string;
      fileHash: string;
      filename: string;
      caption: string;
      views?: number;
      likes?: number;
    }
  ) {
    const { userId, fileHash, filename, caption } = body;

    if (!userId || !fileHash || !filename || !caption) {
      throw new BadRequestException('缺少必要参数');
    }

    return this.uploadService.submitMeta(userId, fileHash, filename, caption);
  }
}
