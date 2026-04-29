import { IsString } from 'class-validator';

export class UploadProductImageDto {
  @IsString({ message: 'file name must be a string' })
  fileName!: string;

  @IsString({ message: 'mime type must be a string' })
  mimeType!: string;

  @IsString({ message: 'file content must be a string' })
  base64!: string;

  @IsString({ message: 'userId must be a string' })
  uploaderUserId!: string;
}

export class AttachProductDto {
  @IsString({ message: 'mediaId must be a string' })
  mediaId!: string;

  @IsString({ message: 'productId must be a string' })
  productId!: string;
}
