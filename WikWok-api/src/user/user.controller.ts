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
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto/userinfo.dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerUser(@Body() registerDto: RegisterUserDto) {
    try {
      const user = await this.userService.registerUser(registerDto);
      return {
        result: {
          id: user.id,
        },
        message: '这是一个用户注册接口',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '注册失败');
    }
  }

  @Post('login')
  async loginUser(@Body() loginDto: LoginUserDto) {
    try {
      const user = await this.userService.loginUser(loginDto);
      return {
        result: {
          id: user.id,
        },
        message: '这是一个用户登录接口',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '登录失败');
    }
  }

  @Get('get-userinfo')
  async getUserinfo(@Query('id') id: string) {
    if (!id) throw new BadRequestException('用户ID不能为空');

    try {
      const user = await this.userService.getUserinfo(id);
      return {
        result: {
          id: user.id,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
          followers: user.followers,
          followings: user.followings,
          videos: user.videos,
        },
        message: '这是一个用户信息获取接口',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取用户信息失败');
    }
  }

  @Post('update-userinfo')
  async updateUserinfo(@Body() updateUserDto: UpdateUserDto) {
    try {
      await this.userService.updateUser(updateUserDto);
      return {
        result: {},
        message: '这是一个用户信息更新接口',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '更新用户信息失败');
    }
  }

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

      const video = await this.userService.uploadVideo({
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
