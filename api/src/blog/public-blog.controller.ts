import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Public Blog')
@Controller('api/blog')
export class PublicBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get()
  findAll() {
    return this.blogService.findAll(false);
  }

  @Public()
  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.blogService.findOneBySlug(slug);
  }
}
