import {
  Controller,
  Get,
  Res,
  Req,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import { DoubleCsrfMiddleware } from 'src/common/middleware/double-csrf.middleware';
import { RegisterUserDto, LoginUserDto } from './auth.dto';

interface RequestWithUser extends Request {
  user?: {
    sub: { userId: string };
    username: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly doubleCsrfMiddleware: DoubleCsrfMiddleware
  ) {}

  @Get('csrf-token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const token = this.doubleCsrfMiddleware.generateCsrfToken(req, res);
    res.json({ csrfToken: token, message: '成功获得csrfToken' });
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: RequestWithUser, @Res() res: Response) {
    if (!req.user) throw new UnauthorizedException('User not found');

    const { sub, username } = req.user;
    const tokens = await this.authService.generateTokens(sub.userId, username);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto, @Res() res: Response) {
    try {
      const { userId, accessToken, refreshToken } =
        await this.authService.registerUser(registerUserDto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
      });

      res.json({
        result: {
          userId,
          accessToken,
        },
        message: '用户注册成功',
      });
    } catch (error) {
      throw new BadRequestException(error.message || '注册失败');
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const { userId, accessToken, refreshToken } = await this.authService.login(loginUserDto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
      });

      res.json({
        result: {
          userId,
          accessToken,
        },
        message: '用户登录成功',
      });
    } catch (error) {
      throw new BadRequestException(error.message || '登录失败');
    }
  }
}
