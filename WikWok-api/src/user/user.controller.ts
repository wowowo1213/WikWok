import { BadRequestException, Controller, Get, Post, Query, Body } from '@nestjs/common';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto/userinfo.dto';
import { UserService } from './user.service';

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
}
