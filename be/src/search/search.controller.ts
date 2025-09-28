import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '@/decorator/customize';

@Controller('search')
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Post('index')
  @Public()
  index(@Body() body: any) {
    return this.svc.indexOne(body);
  }

  @Post('bulk')
  @Public()
  bulk(@Body() body: any[]) {
    return this.svc.bulkIndex(body);
  }

  @Get()
  @Public()
  find(
    @Query('q') q = '',
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('tags') tags?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.svc.search(q, {
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Public()
  @Get('suggest')
  suggest(@Query('q') q: string) {
    return this.svc.suggest(q);
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() patch: any) {
    return this.svc.updatePartial(id, patch);
  }
  @Public()
  @Delete(':id')
  del(@Param('id') id: string) {
    return this.svc.delete(id);
  }
}
