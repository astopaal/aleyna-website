import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeroService } from './hero.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Public Hero')
@Controller('api/hero')
export class PublicHeroController {
  constructor(private readonly heroService: HeroService) {}

  @Public()
  @Get('active')
  getActiveHeroSections() {
    return this.heroService.getActiveHeroSections();
  }
}
