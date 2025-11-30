import { Controller, Get, Post, Query, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './userinfo.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-userinfo')
  async getUserinfo(@Query('id') id: string) {
    if (!id) throw new BadRequestException('用户ID不能为空');

    try {
      const user = await this.userService.getUserinfo(id);

      return {
        result: {
          userId: user.userId,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
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
  async updateUserinfo(@Body() updateUserDto: UpdateUserDto) {
    try {
      await this.userService.updateUser(updateUserDto);
      return {
        result: {},
        message: '更新用户信息成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '更新用户信息失败');
    }
  }
}
