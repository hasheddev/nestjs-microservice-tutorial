import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SearchProduct,
  SearchProductDocument,
} from './search/search-index.schema';
import { Model } from 'mongoose';

type Input = {
  productId: string;
  name: string;
  description: string;
  status: 'Draft' | 'Active';
  price: number;
  imageUrl?: string;
  createdByClerkUserId: string;
};

@Injectable()
export class SearchService {
  private logger = new Logger(SearchService.name);
  constructor(
    @InjectModel(SearchProduct.name)
    private readonly searchModel: Model<SearchProductDocument>,
  ) {}

  private normalizeText(name: string, description: string) {
    return `${name} ${description}`.toLowerCase();
  }

  async deleteFromCatalogEvent(input: {
    productId: string;
    createdByClerkUserId: string;
  }) {
    const result = await this.searchModel
      .findOneAndDelete({
        productId: input.productId,
        createdByClerkUserId: input.createdByClerkUserId,
      })
      .exec();
    if (!result) {
      this.logger.warn(
        `Search document for ${input.productId} already deleted or not found`,
      );
      return;
    }
    return true;
  }

  async upsertFromCatalogEvent(input: Input) {
    const normalizedText = this.normalizeText(input.name, input.description);
    await this.searchModel.findOneAndUpdate(
      { productId: input.productId },
      {
        $set: {
          name: input.name,
          normalizedText,
          status: input.status,
          price: input.price,
          imageUrl: input.imageUrl,
          createdByClerkUserId: input.createdByClerkUserId,
        },
        $setOnInsert: {
          productId: input.productId,
        },
      },
      { upsert: true, setDefaultsOnInsert: true, returnDocument: 'after' },
    );
  }

  async query(input: { q: string; limit?: number }) {
    const q = (input.q ?? '').trim().toLowerCase();
    if (!q) return [];
    const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return this.searchModel
      .find({ normalizedText: { $regex: regex } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async textSearch(input: { q: string; limit?: number }) {
    const q = (input.q ?? '').trim().toLowerCase();
    if (!q) return [];
    const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
    return this.searchModel
      .find({ $text: { $search: q } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();
  }

  ping() {
    return {
      ok: true,
      service: 'search',
      now: new Date().toISOString(),
    };
  }
}
