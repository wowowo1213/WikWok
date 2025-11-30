import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto, LoginUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { user } = await this.userService.registerUser(registerUserDto);
    const payload = { sub: user._id };
    const jwtConstants = {
      secret: '1774a95b554e3fa8732f899bd20e626e7436798f7b2959a6fa5b78238af41f46',
    };
    return {
      userId: user._id,
      jwtToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET }),
    };
  }

  async login(loginUsersDto: LoginUserDto) {
    const { user } = await this.userService.loginUser(loginUsersDto);
    const payload = { sub: user._id };
    return {
      userId: user._id,
      jwtToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET }),
    };
  }
}
