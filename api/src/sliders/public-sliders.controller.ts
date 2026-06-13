import { Controller, Get, Headers, Query, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { resolveLocale } from '../common/utils/locale';
import { SlidersService } from './sliders.service';

@Public()
@ApiTags('Public Sliders')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/sliders')
export class PublicSlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  @ApiQuery({ name: 'locale', required: false, example: 'tr' })
  @ApiHeader({ name: 'Accept-Language', required: false, example: 'tr-TR,tr;q=0.9' })
  findPublished(
    @Query('locale') locale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.slidersService.findPublished(resolveLocale(locale, acceptLanguage));
  }
}
