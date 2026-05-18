import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { Role } from '../common/enums/role.enum';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

@ApiTags('Admin Documents')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.documentsService.findAllForAdmin(query);
  }

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'Document' })
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: { id: string }) {
    return this.documentsService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @CurrentUser() user: { id: string }) {
    return this.documentsService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: { id: string }) {
    return this.documentsService.updateStatus(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Document' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.documentsService.softDelete(id, user.id);
  }
}
