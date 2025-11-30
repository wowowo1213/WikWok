import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import crypto from 'crypto';

declare module 'express-session' {
  interface SessionData {
    csrfSecret?: string;
  }
}

@Injectable()
export class DoubleCsrfMiddleware implements NestMiddleware {
  private readonly doubleCsrfProtection: (req: Request, res: Response, next: NextFunction) => void;
  private readonly generateToken: (
    req: Request,
    res: Response,
    options?: { overwrite?: boolean }
  ) => string;

  constructor() {
    const config: DoubleCsrfConfigOptions = {
      // 生成或获取当前会话的 CSRF 密钥（用于 Token 生成和验证）
      getSecret: (req: Request) => {
        if (!req.session.csrfSecret) {
          req.session.csrfSecret = crypto.randomBytes(32).toString('hex');
        }
        return req.session.csrfSecret;
      },
      // 用于关联会话的唯一标识符（通常为 sessionID）
      getSessionIdentifier: (req: Request) => req.sessionID,
      // 存储 CSRF Token 的 Cookie 名称，这边的cookie前端会收到，但是下面设置 req.headers['wowowo_csrf_token']
      cookieName: 'wowowo_csrf_token',
      cookieOptions: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 min
      },
      size: 64,
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
      getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'], // cookie和请求头都要设置，只有cookie反正不会生效
    };

    // 传入config，初始化 CSRF 防护中间件和 Token 生成函数
    const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf(config);
    this.doubleCsrfProtection = doubleCsrfProtection; // 用于验证csrf-token
    this.generateToken = generateCsrfToken; // 用于手动生成csrf-tokn
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/auth/csrf-token' && req.method === 'GET') {
      return next();
    }
    this.doubleCsrfProtection(req, res, next);
  }

  generateCsrfToken(req: Request, res: Response) {
    return this.generateToken(req, res, { overwrite: true }); // 强制生成一个全新的随机 Token
  }
}
