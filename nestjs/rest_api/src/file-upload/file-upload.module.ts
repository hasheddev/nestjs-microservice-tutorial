import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const FileFeature = TypeOrmModule.forFeature([File]);
const Multer = MulterModule.register({
  storage: memoryStorage(),
});

@Module({
  imports: [FileFeature, CloudinaryModule, Multer],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
