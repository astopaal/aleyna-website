import { Injectable, NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { paginationMeta } from '../common/utils/paginate';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.category.findMany({
      where: { deletedAt: null, status: PublishStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { children: true },
    });
  }

  async findAllForAdmin(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { deletedAt: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
      where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { parent: true, children: true },
      }),
      this.prisma.category.count({ where }),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  }

  create(dto: CreateCategoryDto, actorId?: string) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        description: dto.description,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder,
        createdById: actorId,
        updatedById: actorId,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto, actorId?: string) {
    await this.ensureExists(id);
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, updatedById: actorId },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, actorId?: string) {
    await this.ensureExists(id);
    return this.prisma.category.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
    });
  }

  softDelete(id: string, actorId?: string) {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId },
    });
  }

  private async ensureExists(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');
  }
}
