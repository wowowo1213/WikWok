import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { DoubleCsrfMiddleware } from 'src/common/middleware/double-csrf.middleware';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'wowowoJwtModule',
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy, DoubleCsrfMiddleware],
  exports: [AuthService],
})
export class AuthModule {}
