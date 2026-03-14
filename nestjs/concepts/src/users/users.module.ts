import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HelloModule } from 'src/hello/hello.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [HelloModule],
})
export class UsersModule {}
