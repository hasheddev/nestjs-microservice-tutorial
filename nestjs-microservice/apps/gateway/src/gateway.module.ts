import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';

const rmqurl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const cQueue = process.env.CATALOG_QUEUE ?? 'catalog_queue';
const mQueue = process.env.MEDIA_QUEUE ?? 'media_queue';
const sQueue = process.env.SEARCH_QUEUE ?? 'search_queue';

const ClientModuleConf = ClientsModule.register([
  {
    name: 'CATALOG_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [rmqurl],
      queue: cQueue,
      queueOptions: {
        durable: false,
      },
    },
  },
  {
    name: 'MEDIA_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [rmqurl],
      queue: mQueue,
      queueOptions: {
        durable: false,
      },
    },
  },
  {
    name: 'SEARCH_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [rmqurl],
      queue: sQueue,
      queueOptions: {
        durable: false,
      },
    },
  },
]);

const ConfigModueConf = ConfigModule.forRoot({
  isGlobal: true,
});

const MongooseModuleConf = MongooseModule.forRoot(process.env.MONGODB_URI!);

@Module({
  imports: [
    ClientModuleConf,
    ConfigModueConf,
    MongooseModuleConf,
    UsersModule,
    AuthModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
