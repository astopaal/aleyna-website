import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { CategoriesService } from './categories.service';

@Public()
@ApiTags('Public Categories')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findPublished() {
    return this.categoriesService.findPublished();
  }
}
