import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'wowowoJwtAccessStrategy',
      ignoreExpiration: false,
    });
  }

  validate(payload) {
    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
