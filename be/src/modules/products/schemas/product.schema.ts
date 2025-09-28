import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'products', timestamps: true }) 
export class Product {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true, index: 'text' })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: [String], default: [], index: true })
  tags?: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// index phụ trợ (tuỳ)
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ name: 'text', tags: 1 });
