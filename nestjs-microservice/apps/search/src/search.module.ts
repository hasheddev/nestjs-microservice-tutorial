import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SearchProduct,
  SearchProductSchema,
} from './search/search-index.schema';

const ConfigModuleConf = ConfigModule.forRoot({ isGlobal: true });

const MongooseModuleConf = MongooseModule.forRoot(process.env.MONGODB_URI!);

const MongooseModuleFeatConf = MongooseModule.forFeature([
  {
    name: SearchProduct.name,
    schema: SearchProductSchema,
  },
]);

@Module({
  imports: [ConfigModuleConf, MongooseModuleConf, MongooseModuleFeatConf],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
