import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Role } from '../common/enums/role.enum';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Admin Project')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/projects')
export class AdminProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'Project' })
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: { id: string }) {
    return this.projectService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.projectService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @Audit({ action: AuditAction.UPDATE, entityType: 'Project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser() user: { id: string }) {
    return this.projectService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Project' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.projectService.remove(id, user.id);
  }
}
