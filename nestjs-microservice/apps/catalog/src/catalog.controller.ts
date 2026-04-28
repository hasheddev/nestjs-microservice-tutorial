import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @MessagePattern('service:ping')
  ping() {
    return this.catalogService.ping();
  }
}
