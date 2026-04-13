import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { UploadFiledDto } from './dto/upload-file.dto';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get()
  async findAll() {
    return this.fileUploadService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFiledDto,
    @CurrentUser() user: Omit<User, 'posts' | 'password'>,
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.fileUploadService.uploadFile(
      file,
      user,
      uploadFileDto.description,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: Omit<User, 'posts' | 'password'>,
  ) {
    await this.fileUploadService.delete(id, user);
    return { message: 'File deleted Succesfully' };
  }
}
