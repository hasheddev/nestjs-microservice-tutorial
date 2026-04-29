import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './media/media.schema';

const ConfigModuleConf = ConfigModule.forRoot({ isGlobal: true });
const MongooseModuleConf = MongooseModule.forRoot(process.env.MONGODB_URI!);
const MongooseModuleFeatConf = MongooseModule.forFeature([
  {
    name: Media.name,
    schema: MediaSchema,
  },
]);

@Module({
  imports: [ConfigModuleConf, MongooseModuleConf, MongooseModuleFeatConf],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
