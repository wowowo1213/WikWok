import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  Req,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateUserInfoRequestDto, UpdateUserDto } from './userinfo.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Controller('user')
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-userinfo')
  async getUserInfo(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('用户ID不能为空');

    try {
      const user = await this.userService.getUserInfo(userId);

      return {
        result: user,
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

  @Post(':id/like')
  async likeVideo(@Req() req, @Param('id') videoId: string) {
    const userId = req.user.userId;
    await this.userService.likeVideo(userId, videoId);
    const res = await this.getVideoDetail(videoId);
    return {
      result: res.result,
      message: '点赞成功',
    };
  }

  @Post(':id/unlike')
  async unlikeVideo(@Req() req, @Param('id') videoId: string) {
    const userId = req.user.userId;
    await this.userService.unlikeVideo(userId, videoId);
    const res = await this.getVideoDetail(videoId);
    return {
      result: res.result,
      message: '取消点赞成功',
    };
  }

  @Post(':id/comment')
  async addComment(@Req() req, @Param('id') videoId: string, @Body() body: { text: string }) {
    const userId = req.user.userId;
    const res = await this.userService.addComment(userId, videoId, body.text);
    return {
      result: res,
      message: '新增评论成功',
    };
  }

  @Post(':videoId/comment/:commentId/delete')
  async deleteComment(
    @Req() req,
    @Param('videoId') videoId: string,
    @Param('commentId') commentId: string
  ) {
    const userId = req.user.userId;
    const res = await this.userService.deleteComment(userId, videoId, commentId);
    return {
      message: '删除评论成功',
    };
  }

  @Get('get-video-detail')
  async getVideoDetail(@Query('videoId') videoId: string) {
    try {
      const video = await this.userService.getVideoById(videoId);
      if (!video) throw new BadRequestException('视频不存在');

      const user = {
        userId: video.userId._id,
        username: video.userId.username,
        avatarUrl: video.userId.avatarUrl,
      };

      const formattedVideo = {
        videoId: video._id,
        videoUrl: video.videoUrl,
        filename: video.filename,
        caption: video.caption,
        likes: video.likes,
        views: video.views,
        updatedAt: video.updatedAt,
        isFollowing: null, // 如果需要可以计算
        user,
        comments: video.comments.map(comment => ({
          id: comment._id,
          text: comment.text,
          user: {
            userId: comment.user._id,
            username: comment.user.username,
            avatarUrl: comment.user.avatarUrl,
          },
        })),
      };

      return {
        result: formattedVideo,
        message: '获取视频详情成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取视频详情失败');
    }
  }

  @Post(':videoId/video/delete')
  async deleteVideo(@Req() req, @Param('videoId') videoId: string) {
    const userId = req.user.userId;
    await this.userService.deleteVideo(userId, videoId);
    return {
      message: '删除视频成功',
    };
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
        result: suggestedVideos,
        message: '获取推荐视频成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '获取推荐视频失败');
    }
  }
}
