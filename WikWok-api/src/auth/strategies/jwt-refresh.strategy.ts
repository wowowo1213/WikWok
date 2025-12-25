import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.refreshToken]),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    };
    super(options);
  }

  validate(payload) {
    return {
      sub: payload.sub,
      username: payload.username,
    };
  }
}
