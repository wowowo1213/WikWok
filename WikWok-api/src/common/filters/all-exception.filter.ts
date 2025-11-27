import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { MyLogger } from '../logger/no-timestamp-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new MyLogger();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any)?.message || message;
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    console.error('全局异常捕获', exception);

    this.logger.error(message);

    response.status(status).json({
      statusCode: status,
      message,
      data: null,
      api: request.url,
    });
  }
}
