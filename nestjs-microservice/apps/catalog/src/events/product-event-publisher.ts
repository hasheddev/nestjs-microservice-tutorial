import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ProductCreatedEvent,
  ProductDeletedEvent,
} from '../products/products.events';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductEventsPublisher implements OnModuleInit {
  private readonly logger = new Logger(ProductEventsPublisher.name);

  constructor(
    @Inject('SEARCH_EVENTS_CLIENT')
    private readonly searchEventsClient: ClientProxy,
    @Inject('MEDIA_EVENTS_CLIENT')
    private readonly mediaEventsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.searchEventsClient.connect();
    this.logger.log('Connected to search queue');
  }

  async productCreated(event: ProductCreatedEvent) {
    try {
      await firstValueFrom(
        this.searchEventsClient.emit('product:created', event),
      );
    } catch {
      this.logger.warn(
        `Failed to publish product created event for product ${event.productId}`,
      );
    }
  }

  async productDeleted(eventData: ProductDeletedEvent) {
    const event = {
      productId: eventData.productId,
      createdByClerkUserId: eventData.createdByClerkUserId,
    };
    try {
      if (eventData.mediaExists) {
        this.mediaEventsClient.emit('product:image:deleted', event);
      }
      this.searchEventsClient.emit('product:deleted', event);
      return new Promise((r) => r(true));
    } catch {
      this.logger.warn(
        `Failed to publish product deletion event for product ${event.productId}`,
      );
    }
  }
}
