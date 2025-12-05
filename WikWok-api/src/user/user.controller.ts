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

  @Get('get-following-users')
  async getFollowingUsers(@Query('userId') userId: string) {
    try {
      const followingUsers = await this.userService.getFollowingUsers(userId);
      return {
        result: { users: followingUsers },
        message: '获取已关注用户成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取已关注用户失败');
    }
  }

  @Post('follow-user')
  async followUser(@Body() followDto: { userId; targetUserId }) {
    const { userId, targetUserId } = followDto;
    try {
      await this.userService.followUser(userId, targetUserId);
      return {
        message: '关注成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '关注失败');
    }
  }

  @Post('unfollow-user')
  async unfollowUser(@Body() unfollowDto: { userId; targetUserId }) {
    const { userId, targetUserId } = unfollowDto;
    try {
      await this.userService.unfollowUser(userId, targetUserId);
      return {
        message: '取消关注成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '取消关注失败');
    }
  }
}

@Controller('user-public')
export class UserPublicController {
  constructor(private readonly userService: UserService) {}

  @Get('get-suggested-users')
  async getSuggestedUsers(@Query('userId') userId?: string) {
    try {
      const suggestedUsers = await this.userService.getSuggestedUsers(userId);
      return {
        result: { users: suggestedUsers },
        message: '获取推荐用户成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取推荐用户失败');
    }
  }

  @Get('get-suggested-videos')
  async getSuggestededVideos(@Query('userId') userId?: string) {
    try {
      const suggestedVideos = await this.userService.getSuggestedVideos(userId);
      return {
        result: { videos: suggestedVideos },
        message: '获取推荐视频成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取推荐视频失败');
    }
  }
}
