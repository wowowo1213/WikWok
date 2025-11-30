import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { MyLogger } from './common/logger/no-timestamp-logger';
import cookieParser from 'cookie-parser';
import { DoubleCsrfMiddleware } from './common/middleware/double-csrf.middleware';
import session from 'express-session';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const uploadDir = join(__dirname, '..', 'uploads', 'videos');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule, {
    logger: new MyLogger(),
  });

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,POST,PUT',
    allowedHeaders: 'Content-Type, Authorization, x-csrf-token',
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET!, // 生产环境使用环境变量
      resave: false, // 避免重复保存未修改的 Session
      saveUninitialized: false, // 不保存空 Session
      cookie: { secure: false, httpOnly: true, sameSite: 'lax' },
    })
  );

  app.use(cookieParser());
  app.use(new DoubleCsrfMiddleware().use.bind(new DoubleCsrfMiddleware()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
