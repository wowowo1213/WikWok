import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import * as fs from 'fs/promises';
import { join } from 'path';

@Controller('upload')
@UseGuards(JwtAccessGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('upload-check')
  async checkUploadStatus(@Query('hash') hash: string) {
    if (!hash) throw new BadRequestException('哈希值不能为空');

    return this.uploadService.checkUploadStatus(hash);
  }

  @Post('submit-meta')
  async submitMeta(
    @Body()
    body: {
      userId: string;
      fileHash: string;
      filename: string;
      caption: string;
    }
  ) {
    const { userId, fileHash, filename, caption } = body;

    if (!userId || !fileHash || !filename || !caption)
      throw new BadRequestException('submit-meta接口缺少必要参数');

    return this.uploadService.submitMeta(userId, fileHash, filename, caption);
  }

  @Post('upload-chunk')
  @UseInterceptors(
    FileInterceptor('chunk', {
      storage: diskStorage({
        destination: join(__dirname, '../../uploads/temp'),
        filename: (req, file, cb) => {
          const hash = req.body.hash as string;
          cb(null, hash);
        },
      }),
      limits: {
        fileSize: 40 * 1024 * 1024,
      },
    })
  )
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { hash: string; chunkIndex: string; filename: string; chunkCount: string }
  ) {
    const { hash, filename, chunkCount, chunkIndex } = body;

    if (!hash || !chunkIndex || !filename || !chunkCount) {
      if (file?.path) {
        await fs.unlink(file.path).catch(err => {
          console.error('删除临时文件失败:', err);
        });
      }
      throw new BadRequestException('upload-chunk缺少必要参数');
    }

    if (!file) throw new BadRequestException('upload-chunk未上传文件');

    return { success: true };
  }

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

    if (!userId || !fileHash || !filename || !caption || !chunkCount)
      throw new BadRequestException('缺少必要参数');

    return this.uploadService.mergeChunks(userId, fileHash, filename, caption, chunkCount);
  }
}
