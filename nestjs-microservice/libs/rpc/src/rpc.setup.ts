import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from './rpc-exception.filters';

export function applyToMicorserviceLayer(app: INestMicroservice) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new RpcExceptionFilter());
}
