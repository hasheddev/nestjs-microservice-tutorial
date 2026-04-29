import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './products/product.schema';
import { ProductController } from './products/products.controller';
import { ProductService } from './products/products.service';

const ConfigModuleConf = ConfigModule.forRoot({ isGlobal: true });

const MongooseModuleConf = MongooseModule.forRoot(process.env.MONGODB_URI!);

const MongooseModuleFeatConf = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);

@Module({
  imports: [ConfigModuleConf, MongooseModuleConf, MongooseModuleFeatConf],
  controllers: [CatalogController, ProductController],
  providers: [CatalogService, ProductService],
})
export class CatalogModule {}
