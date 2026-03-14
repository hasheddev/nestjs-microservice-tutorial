import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    return `Hello from ${this.getAppName()}`;
  }
  getAppName(): string {
    return this.configService.get<string>('APP_NAME', 'DEFAULT');
  }
}
