import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { MyLogger } from './common/logger/no-timestamp-logger';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // scrf-token的验证有问题，生成了token，且前端也已经获得了，且请求也携带了，但是验证不过
  // app.use(cookieParser());
  // app.use(
  //   csurf({
  //     cookie: {
  //       key: 'XSRF-TOKEN',
  //       path: '/',
  //       httpOnly: true,
  //     },
  //   })
  // );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
