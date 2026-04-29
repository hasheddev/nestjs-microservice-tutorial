import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../auth/current-user.decorator';
import { type UserContext } from '../auth/auth.type';
import { mapAllRpcErrorToHttp } from '@app/rpc';
import { firstValueFrom } from 'rxjs';
import { Pubic } from '../auth/public.decorator';

type Input = {
  name: string;
  description: string;
  price: number;
  status?: string;
  imageUrl?: string;
};

type Product = Pick<Input, 'name' | 'description' | 'imageUrl' | 'price'> & {
  _id: string;
  status: 'Draft' | 'Active';
  createdByClerkUserId: string;
};

@Controller('products')
export class ProductshttpController {
  constructor(
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
  ) {}

  @Post('new')
  async createProduct(@CurrentUser() user: UserContext, @Body() body: Input) {
    const payload = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      createdByClerkUserId: user.clerkUserId,
      status: body.status,
      imageUrl: '',
    };
    try {
      const product = await firstValueFrom(
        this.catalogClient.send<Product>('product:create', payload),
      );
      return product;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }

  @Pubic()
  @Get()
  async getAllProducts() {
    try {
      const products = await firstValueFrom(
        this.catalogClient.send<Product[]>('product:list', {}),
      );
      return products;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    try {
      const product = await firstValueFrom(
        this.catalogClient.send<Product>('product:getById', { id }),
      );
      return product;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }
}
