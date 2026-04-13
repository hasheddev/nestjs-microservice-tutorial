import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { User, UserRole } from 'src/auth/entities/user.entity';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    user: Omit<User, 'posts' | 'password'>,
    description?: string,
  ): Promise<File> {
    const response = await this.cloudinaryService.uploadFile(file);
    const newFile = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      publicId: response.public_id,
      url: response.secure_url,
      description,
      uploader: user,
    });
    return this.fileRepository.save(newFile);
  }

  async findAll(): Promise<File[]> {
    return this.fileRepository.find({
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(
    id: string,
    user: Omit<User, 'posts' | 'password'>,
  ): Promise<void> {
    const fileToDelete = await this.fileRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });
    if (!fileToDelete) {
      throw new NotFoundException('file not found');
    }
    if (fileToDelete.uploader.id !== user.id && user.role !== UserRole.Admin) {
      throw new ForbiddenException('You can only delete your file');
    }
    await this.cloudinaryService.deleteFile(fileToDelete.publicId);

    await this.fileRepository.remove(fileToDelete);
  }
}
