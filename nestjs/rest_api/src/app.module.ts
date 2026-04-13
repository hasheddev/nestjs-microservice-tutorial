import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './posts/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { FileUploadModule } from './file-upload/file-upload.module';
import { File } from './file-upload/entities/file.entity';
import { EventsModule } from './events/events.module';

const TypeOrm = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [Post, User, File],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
  }),
});

const Throttler = ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]);

const Cache = CacheModule.register({
  isGlobal: true,
  ttl: 30000,
  max: 100,
});

const Config = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().default('nest_youtube'),
    CLOUD_NAME: Joi.string().required(),
    API_KEY: Joi.string().required(),
    API_SECRET: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  }),
});

@Module({
  imports: [
    PostsModule,
    TypeOrm,
    AuthModule,
    Throttler,
    Cache,
    Config,
    FileUploadModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
