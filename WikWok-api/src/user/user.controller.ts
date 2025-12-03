import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateUserInfoRequestDto, UpdateUserDto } from './userinfo.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-userinfo')
  async getUserInfo(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('用户ID不能为空');

    try {
      const user = await this.userService.getUserInfo(userId);

      return {
        result: {
          userId: user.userId,
          username: user.username,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          followers: user.followers,
          followings: user.followings,
          videos: user.videos,
        },
        message: '获取用户信息成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取用户信息失败');
    }
  }

  @Post('update-userinfo')
  @UseInterceptors(FileInterceptor('image'))
  async updateUserInfo(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: UpdateUserInfoRequestDto
  ) {
    try {
      const updateUserDto: UpdateUserDto = {
        userId: body.userId,
        username: body.username,
        bio: body.bio,
        image,
        height: body.height,
        width: body.width,
        top: body.top,
        left: body.left,
      };

      await this.userService.updateUserInfo(updateUserDto);
      return {
        message: '更新用户信息成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '更新用户信息失败');
    }
  }
}
