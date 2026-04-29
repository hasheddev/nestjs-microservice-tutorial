import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { MediaService } from './media.service';
import { AttachProductDto, UploadProductImageDto } from './media/media.dto';

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

  @MessagePattern('service:ping')
  ping() {
    return this.mediaService.ping();
  }
}
