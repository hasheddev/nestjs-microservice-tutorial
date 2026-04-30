import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './products/product.schema';
import { ProductController } from './products/products.controller';
import { ProductService } from './products/products.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductEventsPublisher } from './events/product-event-publisher';

const ConfigModuleConf = ConfigModule.forRoot({ isGlobal: true });

const MongooseModuleConf = MongooseModule.forRoot(process.env.MONGODB_URI!);

const MongooseModuleFeatConf = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);

const rmqurl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const sQueue = process.env.SEARCH_QUEUE ?? 'search_queue';
const mQueue = process.env.MEDIA_QUEUE ?? 'media_queue';

const ClientModuleConf = ClientsModule.register([
  {
    name: 'SEARCH_EVENTS_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [rmqurl],
      queue: sQueue,
      queueOptions: {
        durable: false,
      },
    },
  },

  {
    name: 'MEDIA_EVENTS_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [rmqurl],
      queue: mQueue,
      queueOptions: {
        durable: false,
      },
    },
  },
]);

@Module({
  imports: [
    ConfigModuleConf,
    MongooseModuleConf,
    MongooseModuleFeatConf,
    ClientModuleConf,
  ],
  controllers: [CatalogController, ProductController],
  providers: [CatalogService, ProductService, ProductEventsPublisher],
})
export class CatalogModule {}
