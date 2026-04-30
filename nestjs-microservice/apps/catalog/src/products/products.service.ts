import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { isValidObjectId, Model } from 'mongoose';
import { rpcBadRequest, rpcInternalServerError, rpcNotFound } from '@app/rpc';
import { ProductEventsPublisher } from '../events/product-event-publisher';

type Input = {
  name: string;
  description: string;
  price: number;
  status?: string;
  imageUrl?: string;
  createdByClerkUserId?: string;
};

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly events: ProductEventsPublisher,
  ) {}

  async createNewProduct(input: Input) {
    if (!input.name || !input.description) {
      rpcBadRequest('name and description are required');
    }
    if (
      typeof input.price !== 'number' ||
      isNaN(input.price) ||
      input.price < 0
    ) {
      rpcBadRequest('Price must be a valid number greater than or equal to 0');
    }

    if (input.status && input.status !== 'Draft' && input.status !== 'Active') {
      rpcBadRequest('Status must be either draft or active');
    }

    if (!input.createdByClerkUserId) {
      rpcBadRequest('User id required');
    }

    const newProduct = await this.productModel.create({
      name: input.name,
      description: input.description,
      status: input.status ?? 'Draft',
      imageUrl: input.imageUrl ?? '',
      createdByClerkUserId: input.createdByClerkUserId,
      price: input.price,
    });
    await this.events.productCreated({
      productId: String(newProduct._id),
      description: newProduct.description,
      name: newProduct.name,
      price: newProduct.price,
      status: newProduct.status,
      imageUrl: newProduct.imageUrl,
      createdByClerkUserId: newProduct.createdByClerkUserId,
    });
    return newProduct;
  }

  async deleteProduct(input: {
    productId: string;
    createdByClerkUserId: string;
    mediaExists: boolean;
  }) {
    const result = await this.productModel
      .deleteMany({
        _id: input.productId,
        createdByClerkUserId: input.createdByClerkUserId,
      })
      .exec();
    if (!result.acknowledged) {
      rpcInternalServerError('failed to delete product');
    }

    if (result.deletedCount === 0) {
      this.logger.warn(
        `Product ${input.productId} not found for user ${input.createdByClerkUserId}. Skipping cleanup.`,
      );
      return;
    }
    return this.events.productDeleted(input);
  }

  async listProducts() {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async getProductById(input: { id: string }) {
    if (!isValidObjectId(input.id)) {
      rpcBadRequest('Invalid Product Id');
    }
    const product = await this.productModel.findById(input.id).exec();
    if (!product) {
      rpcNotFound(`Product with id ${input.id} not found`);
    }
    return product;
  }
}
