import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UsersService } from './users.service';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAllAdmins();
  }

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'User' })
  create(@Body() dto: CreateAdminUserDto, @CurrentUser() user: { id: string }) {
    return this.usersService.createAdmin(dto, user.id);
  }

  @Patch(':id')
  @Audit({ action: AuditAction.UPDATE, entityType: 'User' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto, @CurrentUser() user: { id: string }) {
    return this.usersService.updateAdmin(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'User' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.usersService.softDeleteAdmin(id, user.id);
  }
}
