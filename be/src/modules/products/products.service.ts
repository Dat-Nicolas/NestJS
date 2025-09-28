import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchService } from '@/search/search.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    private readonly search: SearchService, 
  ) {}

  async create(dto: CreateProductDto) {
    const doc = await this.model.create(dto);
    await this.search.indexOne({
      id: doc.id,
      name: doc.name,
      slug: doc.slug,
      price: doc.price,
      tags: doc.tags,
    });
    return doc;
  }

  async findAll(page = 1, size = 10) {
    const skip = (Math.max(1, page) - 1) * size;
    const [items, total] = await Promise.all([
      this.model.find().sort({ createdAt: -1 }).skip(skip).limit(size).lean(),
      this.model.countDocuments(),
    ]);
    return { total, items, page, size };
  }

  async findOne(id: string) {
    return this.model.findOne({ id }).lean();
  }

  async update(id: string, patch: Partial<CreateProductDto>) {
    const doc = await this.model.findOneAndUpdate({ id }, patch, { new: true }).lean();
    if (doc) {
      await this.search.updatePartial(id, patch); 
    }
    return doc;
  }

  async remove(id: string) {
    await this.model.deleteOne({ id });
    await this.search.delete(id); 
    return { ok: true };
  }
}
