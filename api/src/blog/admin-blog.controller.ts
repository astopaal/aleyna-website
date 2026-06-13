import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Role } from '../common/enums/role.enum';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@ApiTags('Admin Blog')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/blog')
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'Blog' })
  create(@Body() dto: CreateBlogDto, @CurrentUser() user: { id: string }) {
    return this.blogService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.blogService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @Audit({ action: AuditAction.UPDATE, entityType: 'Blog' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto, @CurrentUser() user: { id: string }) {
    return this.blogService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Blog' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.blogService.remove(id, user.id);
  }
}
