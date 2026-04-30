import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { SearchService } from './search.service';
import {
  ProductCreatedDto,
  ProductDeletedDto,
} from './events/product-events.dto';
import { SearchQueryDto } from './search/search-query.dto';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @EventPattern('product:created')
  async onProductCreated(@Payload() payload: ProductCreatedDto) {
    await this.searchService.upsertFromCatalogEvent(payload);
  }

  @EventPattern('product:deleted')
  async onProductDeleted(@Payload() payload: ProductDeletedDto) {
    await this.searchService.deleteFromCatalogEvent(payload);
  }

  @MessagePattern('product:search')
  async onProductSearch(@Payload() payload: SearchQueryDto) {
    return this.searchService.query(payload);
  }

  @MessagePattern('service:ping')
  ping() {
    return this.searchService.ping();
  }
}
