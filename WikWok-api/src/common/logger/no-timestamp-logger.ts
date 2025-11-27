import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class MyLogger implements LoggerService {
  private logDir = path.resolve(__dirname, '../../../logs');

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(level: string, message: any) {
    const logFile = path.join(this.logDir, `${level}.log`);
    const logMsg = `[${new Date().toISOString()}]  ${message} \n`;

    fs.appendFile(logFile, logMsg, (err) => {
      if (err) {
        console.error('写日志失败', err);
      }
    });
  }

  log(message: any) {
    console.log('[LOG]', message);
    this.writeLog('log', message);
  }

  error(message: any, trace?: string) {
    console.error('[错误日志输出]', message, trace ? `\n${trace}` : '');
    this.writeLog('error', ` ${message}${trace ? `\n${trace}}` : ''}`);
  }

  warn(message: any) {
    console.warn('[WARN]', message);
    this.writeLog('warn', message);
  }
}
