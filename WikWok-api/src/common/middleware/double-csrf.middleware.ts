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
      getSecret: (req: Request) => {
        if (!req.session.csrfSecret) {
          req.session.csrfSecret = crypto.randomBytes(32).toString('hex');
        }
        return req.session.csrfSecret;
      },
      getSessionIdentifier: (req: Request) => req.sessionID,
      cookieName: 'wowowo_csrf_token',
      cookieOptions: {
        httpOnly: true,
        secure: false, // 这边设置true使用https协议
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      },
      size: 64,
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
      getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'],
    };

    const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf(config);
    this.doubleCsrfProtection = doubleCsrfProtection;
    this.generateToken = generateCsrfToken;
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/auth/csrf-token' && req.method === 'GET') {
      return next();
    }
    this.doubleCsrfProtection(req, res, next);
  }

  generateCsrfToken(req: Request, res: Response) {
    return this.generateToken(req, res);
  }
}
