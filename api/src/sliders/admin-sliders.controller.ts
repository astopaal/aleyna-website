import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { Role } from '../common/enums/role.enum';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { SlidersService } from './sliders.service';

@ApiTags('Admin Sliders')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/sliders')
export class AdminSlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.slidersService.findAllForAdmin(query);
  }

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'Slider' })
  create(@Body() dto: CreateSliderDto, @CurrentUser() user: { id: string }) {
    return this.slidersService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSliderDto, @CurrentUser() user: { id: string }) {
    return this.slidersService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: { id: string }) {
    return this.slidersService.updateStatus(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Slider' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.slidersService.softDelete(id, user.id);
  }
}
