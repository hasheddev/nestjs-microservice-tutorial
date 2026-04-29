import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.schema';
import { UserService } from './users.service';

const MongooseModuleConf = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);

@Module({
  imports: [MongooseModuleConf],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
