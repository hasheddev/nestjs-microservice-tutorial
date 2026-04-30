import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { MediaService } from './media.service';
import {
  AttachProductDto,
  FetchMediaDto,
  ProductDeletedDto,
  ProductImageDeletedDto,
  UploadProductImageDto,
} from './media/media.dto';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern('media:uploadImage')
  uploadProductImage(@Payload() payload: UploadProductImageDto) {
    return this.mediaService.uploadProductImage(payload);
  }

  @MessagePattern('media:attachImageToProduct')
  attachImageToProduct(@Payload() payload: AttachProductDto) {
    return this.mediaService.attachToProduct(payload);
  }

  @MessagePattern('product:image:delete')
  deleteFromCloudinary(@Payload() payload: ProductImageDeletedDto) {
    return this.mediaService.deleteFromCloudinary(payload);
  }

  @MessagePattern('product:image:fetch')
  fetchMediaData(@Payload() payload: FetchMediaDto) {
    return this.mediaService.fetchImage(payload);
  }

  @EventPattern('product:image:deleted')
  deleteFromDb(@Payload() payload: ProductDeletedDto) {
    return this.mediaService.deleteFromDb(payload);
  }

  @MessagePattern('service:ping')
  ping() {
    return this.mediaService.ping();
  }
}
