import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';
import { DocumentsService } from './documents.service';

@Public()
@ApiTags('Public Documents')
@UseInterceptors(CacheControlInterceptor)
@Controller('api/public/documents')
export class PublicDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findPublished() {
    return this.documentsService.findPublished();
  }
}
