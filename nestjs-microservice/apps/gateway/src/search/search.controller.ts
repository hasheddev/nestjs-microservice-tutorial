import { Body, Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { mapAllRpcErrorToHttp } from '@app/rpc';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/public.decorator';

type Product = {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  _id: string;
  status: 'Draft' | 'Active';
  createdByClerkUserId: string;
};

@Controller('products')
export class SearchhttpController {
  constructor(
    @Inject('SEARCH_CLIENT') private readonly searchClient: ClientProxy,
  ) {}

  @Public()
  @Get('search')
  async getAllProducts(
    @Query('q') q: string,
    @Query('limit') rawLimit?: string,
  ) {
    const number = parseInt(rawLimit?.trim() || '');
    const limit = isNaN(number) ? undefined : number;
    try {
      const products = await firstValueFrom(
        this.searchClient.send<Product[]>('product:search', { q, limit }),
      );
      const response = {
        q,
        count: Array.isArray(products) ? products.length : 0,
        products,
      };
      return response;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }
}
