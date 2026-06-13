import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Public Project')
@Controller('api/projects')
export class PublicProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Public()
  @Get()
  findAll() {
    return this.projectService.findAll(false);
  }

  @Public()
  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.projectService.findOneBySlug(slug);
  }
}
