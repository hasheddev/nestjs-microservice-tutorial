import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { MediaModule } from './media.module';

async function bootstrap() {
  process.title = 'media';
  const logger = new Logger('MediaBootstrap');
  const port = Number(process.env.MEDIA_TCP_PORT ?? 4013);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  );

  await app.listen();
  logger.log(`Media micorservice (TCP) listening on port ${port}`);
}

bootstrap();
