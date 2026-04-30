import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

//Text Search add
// @Prop({ required: true, index: 'text' }) // Add 'text' index here
// name!: string;

// @Prop({ required: true, index: 'text' }) // And here
// description!: string;

@Schema({ timestamps: true })
export class SearchProduct {
  @Prop({ required: true, unique: true, index: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  normalizedText!: string;

  @Prop({ required: true, enum: ['Draft', 'Active'], default: 'Draft' })
  status!: 'Draft' | 'Active';

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  createdByClerkUserId!: string;

  @Prop({ required: false })
  imageUrl?: string;
}

export type SearchProductDocument = HydratedDocument<SearchProduct>;

export const SearchProductSchema = SchemaFactory.createForClass(SearchProduct);
