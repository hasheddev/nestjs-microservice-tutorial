import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @MessagePattern('service:ping')
  ping() {
    return this.searchService.ping();
  }
}
