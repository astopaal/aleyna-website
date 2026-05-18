import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { Role } from '../common/enums/role.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoriesService.findAllForAdmin(query);
  }

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'Category' })
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: { id: string }) {
    return this.categoriesService.create(dto, user.id);
  }

  @Patch(':id')
  @Audit({ action: AuditAction.UPDATE, entityType: 'Category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: { id: string }) {
    return this.categoriesService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @Audit({ action: AuditAction.PUBLISH, entityType: 'Category' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: { id: string }) {
    return this.categoriesService.updateStatus(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Category' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.categoriesService.softDelete(id, user.id);
  }
}
