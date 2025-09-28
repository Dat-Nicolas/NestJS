import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.svc.create(dto);
  }
  @Post('seed')
  seed(@Body() body: CreateProductDto[]) {
    return Promise.all(body.map((b) => this.svc.create(b)));
  }

  @Get()
  list(@Query('page') page = '1', @Query('size') size = '10') {
    return this.svc.findAll(parseInt(page, 10), parseInt(size, 10));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() patch: Partial<CreateProductDto>) {
    return this.svc.update(id, patch);
  }

  @Delete(':id')
  del(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
