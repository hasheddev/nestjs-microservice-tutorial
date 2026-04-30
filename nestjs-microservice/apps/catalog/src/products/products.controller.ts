import { Controller } from '@nestjs/common';
import { ProductService } from './products.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductDto,
  GetProductByIdDto,
  ProductDeletedDto,
} from './product.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('product:create')
  create(@Payload() payload: CreateProductDto) {
    return this.productService.createNewProduct(payload);
  }

  @EventPattern('product:delete')
  delete(@Payload() payload: ProductDeletedDto) {
    return this.productService.deleteProduct(payload);
  }

  @MessagePattern('product:list')
  list() {
    return this.productService.listProducts();
  }

  @MessagePattern('product:getById')
  getById(@Payload() payload: GetProductByIdDto) {
    return this.productService.getProductById(payload);
  }
}
