import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductsService } from './products.service';

@Public()
@ApiTags('Public Products')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findPublished(@Query() query: ProductFilterDto) {
    return this.productsService.findPublished(query);
  }

  @Get(':slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.productsService.findPublishedBySlug(slug);
  }
}
