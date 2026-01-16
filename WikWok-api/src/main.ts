import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { MyLogger } from './common/logger/no-timestamp-logger';
import cookieParser from 'cookie-parser';
import { DoubleCsrfMiddleware } from 'src/common/middleware/double-csrf.middleware';
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
    methods: 'GET,POST,PUT,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-csrf-token',
    credentials: true,
  });

  // csrf-csrf的配置中需要将 req.session.csrfSecret 存入这个 session 中
  app.use(
    session({
      secret: process.env.CSRF_SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // 可设置为使用https传输
        httpOnly: true,
        sameSite: 'lax',
      },
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
