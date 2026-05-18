import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Admin Products')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
@Controller('api/admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductFilterDto) {
    return this.productsService.findAllForAdmin(query);
  }

  @Post()
  @Audit({ action: AuditAction.CREATE, entityType: 'Product' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: { id: string }) {
    return this.productsService.create(dto, user.id);
  }

  @Patch(':id')
  @Audit({ action: AuditAction.UPDATE, entityType: 'Product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: { id: string }) {
    return this.productsService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @Audit({ action: AuditAction.PUBLISH, entityType: 'Product' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProductStatusDto, @CurrentUser() user: { id: string }) {
    return this.productsService.updateStatus(id, dto, user.id);
  }

  @Delete(':id')
  @Audit({ action: AuditAction.DELETE, entityType: 'Product' })
  softDelete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.productsService.softDelete(id, user.id);
  }
}
