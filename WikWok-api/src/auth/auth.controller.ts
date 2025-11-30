import { Controller, Get, Res, Req, Post, Body, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { DoubleCsrfMiddleware } from 'src/common/middleware/double-csrf.middleware';
import { RegisterUserDto, LoginUserDto } from './auth.dto';
import { rmSync } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly doubleCsrfMiddleware: DoubleCsrfMiddleware
  ) {}

  @Get('wowowo1')
  tesing1() {
    return {
      message: '你好啊，testing1',
    };
  }

  @Post('wowowo2')
  tesing2(@Body() number: number) {
    return {
      result: {
        number,
      },
      message: '你好啊',
    };
  }

  @Get('csrf-token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const token = this.doubleCsrfMiddleware.generateCsrfToken(req, res);
    res.json({ csrfToken: token, message: '成功获得csrfToken' });
  }

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      const { userId, jwtToken } = await this.authService.registerUser(registerUserDto);
      return {
        result: {
          userId,
          jwtToken,
        },
        message: '用户注册成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '注册失败');
    }
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    try {
      const { userId, jwtToken } = await this.authService.login(loginUserDto);
      return {
        result: {
          userId,
          jwtToken,
        },
        message: '用户登录成功',
      };
    } catch (error) {
      throw new BadRequestException(error.message || '登录失败');
    }
  }
}
