import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { CatalogModule } from './catalog.module';
import { applyToMicorserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = 'catalog';

  const logger = new Logger('CatalogBootstrap');

  //const port = Number(process.env.CATALOG_TCP_PORT ?? 4011);
  const rmqurl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const queue = process.env.CATALOG_QUEUE ?? 'catalog_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqurl],
        queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  applyToMicorserviceLayer(app);
  app.enableShutdownHooks();
  await app.listen();
  logger.log(
    `Catalog micorservice (RMQ) listening on queue ${queue} via ${rmqurl}`,
  );
}
bootstrap();
