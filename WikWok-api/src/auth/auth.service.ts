import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto, LoginUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async generateTokens(userId: string, username: string) {
    if (!userId || !username) throw new UnauthorizedException('Invalid user ID or username');

    const accessToken = this.jwtService.sign(
      {
        userId,
        username,
      },
      { secret: 'wowowoJwtAccessStrategy', expiresIn: '30min' }
    );

    const refreshToken = this.jwtService.sign(
      {
        userId,
        username,
      },
      {
        secret: 'wowowoJwtRefreshStrategy',
        expiresIn: '7d',
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, username: string) {
    const accessToken = this.jwtService.sign(
      {
        userId,
        username,
      },
      { secret: 'wowowoJwtAccessStrategy', expiresIn: '30min' }
    );
    return accessToken;
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { user } = await this.userService.registerUser(registerUserDto);
    const { accessToken, refreshToken } = await this.generateTokens(
      user._id.toString(),
      user.username
    );
    return { userId: user._id, accessToken, refreshToken };
  }

  async login(loginUserDto: LoginUserDto) {
    const { user } = await this.userService.loginUser(loginUserDto);
    const { accessToken, refreshToken } = await this.generateTokens(
      user._id.toString(),
      user.username
    );
    return { userId: user._id, accessToken, refreshToken };
  }
}
