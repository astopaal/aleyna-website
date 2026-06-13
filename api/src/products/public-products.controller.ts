import { Controller, Get, Headers, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { resolveLocale } from '../common/utils/locale';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductsService } from './products.service';

@Public()
@ApiTags('Public Products')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'locale', required: false, example: 'tr' })
  @ApiHeader({ name: 'Accept-Language', required: false, example: 'tr-TR,tr;q=0.9' })
  findPublished(
    @Query() query: ProductFilterDto,
    @Query('locale') locale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.findPublished(query, resolveLocale(locale, acceptLanguage));
  }

  @Get(':slug')
  @ApiQuery({ name: 'locale', required: false, example: 'tr' })
  @ApiHeader({ name: 'Accept-Language', required: false, example: 'tr-TR,tr;q=0.9' })
  findPublishedBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.findPublishedBySlug(slug, resolveLocale(locale, acceptLanguage));
  }
}
