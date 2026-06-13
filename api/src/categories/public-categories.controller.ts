import { Controller, Get, Headers, Query, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { resolveLocale } from '../common/utils/locale';
import { CategoriesService } from './categories.service';

@Public()
@ApiTags('Public Categories')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiQuery({ name: 'locale', required: false, example: 'tr' })
  @ApiHeader({ name: 'Accept-Language', required: false, example: 'tr-TR,tr;q=0.9' })
  findPublished(
    @Query('locale') locale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.categoriesService.findPublished(resolveLocale(locale, acceptLanguage));
  }
}
