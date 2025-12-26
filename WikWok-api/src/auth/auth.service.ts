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

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, username },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15min', // 短有效期
        }
      ),
      this.jwtService.signAsync(
        { sub: userId, username },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d', // 长有效期
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, username: string) {
    return this.generateTokens(userId, username);
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
