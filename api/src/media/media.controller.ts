import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';

@ApiTags('Admin Media')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: { page?: number; limit?: number }) {
    return this.mediaService.findAll({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    });
  }

  @Post('upload')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Audit({ action: AuditAction.CREATE, entityType: 'Media' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'products' },
        altText: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.mediaService.upload(file, dto, user.id);
  }

  @Get('orphans')
  findOrphans() {
    return this.mediaService.findOrphans();
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Media' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.mediaService.softDelete(id, user.id);
  }
}
