import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        let message = 'SUCCESS';
        let realData = data;
        let code = 200;

        if (typeof data === 'object' && data?.message && data?.result) {
          message = data.message;
          realData = data.result;
          if (data?.code) {
            code = data.code;
          }
        }
        response.status(code);
        return {
          statusCode: code,
          message,
          data: realData,
          api: request.url,
        };
      }),
    );
  }
}
