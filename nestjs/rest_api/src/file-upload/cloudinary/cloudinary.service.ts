import { Inject, Injectable } from '@nestjs/common';
import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import 'multer';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary,
  ) {}

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'nestjs-course',
          resource_type: 'auto',
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error) reject(error as unknown as Error);
          resolve(result as UploadApiResponse);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
