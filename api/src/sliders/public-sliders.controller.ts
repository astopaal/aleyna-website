import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { SlidersService } from './sliders.service';

@Public()
@ApiTags('Public Sliders')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/sliders')
export class PublicSlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  findPublished() {
    return this.slidersService.findPublished();
  }
}
