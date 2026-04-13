import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';

const TypeOrmFeatures = TypeOrmModule.forFeature([Post]);

@Module({
  imports: [TypeOrmFeatures, AuthModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
