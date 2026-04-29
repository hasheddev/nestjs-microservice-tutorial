import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, unique: true, index: true })
  publicId!: string;

  @Prop({ required: true })
  uploaderUserId!: string;

  @Prop({ required: false })
  productId?: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

export type MediaDocument = HydratedDocument<Media>;
