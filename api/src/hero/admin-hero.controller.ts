import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { Role } from '../common/enums/role.enum';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { HeroService } from './hero.service';

@ApiTags('Admin Hero')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/hero')
export class AdminHeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.heroService.findAllForAdmin(query);
  }

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'HeroSection' })
  create(@Body() dto: CreateHeroSectionDto, @CurrentUser() user: { id: string }) {
    return this.heroService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHeroSectionDto, @CurrentUser() user: { id: string }) {
    return this.heroService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: { id: string }) {
    return this.heroService.updateStatus(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'HeroSection' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.heroService.softDelete(id, user.id);
  }
}
