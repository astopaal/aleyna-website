import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeroService } from './hero.service';
import { Public } from '../common/decorators/public.decorator';
import { resolveLocale } from '../common/utils/locale';

@ApiTags('Public Hero')
@Controller('api/hero')
export class PublicHeroController {
  constructor(private readonly heroService: HeroService) {}

  @Public()
  @Get('active')
  getActiveHeroSections(
    @Query('locale') locale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.heroService.getActiveHeroSections(resolveLocale(locale, acceptLanguage));
  }
}
