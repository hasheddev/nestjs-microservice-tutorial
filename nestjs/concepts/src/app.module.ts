import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './hello/hello.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';

const validationSchema = joi.object({
  APP_NAME: joi.string().default('defaultAppName'),
});
//or use load: [function] #custom config
// () => ({appName: process.env.APP_NAME})
//configService.get('appName', 'default')
const GlobalConfig = ConfigModule.forRoot({ isGlobal: true, validationSchema });

@Module({
  imports: [GlobalConfig, HelloModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
