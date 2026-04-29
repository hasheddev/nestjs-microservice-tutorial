import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true, enum: ['Draft', 'Active'], default: 'Draft' })
  status!: ProductStatus;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  createdByClerkUserId!: string;
}

export type ProductStatus = 'Draft' | 'Active';

export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product);
