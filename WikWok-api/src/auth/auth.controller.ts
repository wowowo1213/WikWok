import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('csrf-cookie')
  getCsrfToken(@Res({ passthrough: true }) res: Response) {}
}
