import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, PublishStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { paginationMeta } from '../common/utils/paginate';
import { slugify } from '../common/utils/slugify';
import { getLocalizedFields, type SupportedLocale } from '../common/utils/locale';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async findPublished(locale?: SupportedLocale) {
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
        parentId: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: this.categoryTreeInclude(),
    });

    return categories.map((category) => this.serializeCategory(category, locale));
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
        translations: dto.translations,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder,
        createdById: actorId,
        updatedById: actorId,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto, actorId?: string) {
    const before = await this.ensureExists(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: { ...dto, updatedById: actorId },
    });
    await this.auditService.log({
      actorId,
      action: AuditAction.UPDATE,
      entityType: 'Category',
      entityId: id,
      metadata: this.auditService.buildChangeMetadata(before, category),
    });
    return category;
  }

  async updateStatus(id: string, dto: UpdateStatusDto, actorId?: string) {
    const before = await this.ensureExists(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
    });
    await this.auditService.log({
      actorId,
      action: this.statusAuditAction(dto.status),
      entityType: 'Category',
      entityId: id,
      metadata: this.auditService.buildChangeMetadata(before, category),
    });
    return category;
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
    return category;
  }

  private categoryTreeInclude() {
    return {
      children: {
        where: { deletedAt: null, status: PublishStatus.PUBLISHED },
        orderBy: [{ sortOrder: 'asc' as const }, { name: 'asc' as const }],
        include: {
          children: {
            where: { deletedAt: null, status: PublishStatus.PUBLISHED },
            orderBy: [{ sortOrder: 'asc' as const }, { name: 'asc' as const }],
            include: {
              children: {
                where: { deletedAt: null, status: PublishStatus.PUBLISHED },
                orderBy: [{ sortOrder: 'asc' as const }, { name: 'asc' as const }],
              },
            },
          },
        },
      },
    };
  }

  private serializeCategory(category: any, locale?: SupportedLocale): any {
    const fields = locale ? getLocalizedFields(category.translations, locale) : {};

    return {
      ...category,
      name: fields.name || category.name,
      description: fields.description ?? category.description,
      seoTitle: fields.seoTitle || category.seoTitle,
      seoDescription: fields.seoDescription ?? category.seoDescription,
      children: (category.children ?? []).map((child: any) =>
        this.serializeCategory(child, locale),
      ),
    };
  }

  private statusAuditAction(status: PublishStatus) {
    if (status === PublishStatus.PUBLISHED) return AuditAction.PUBLISH;
    if (status === PublishStatus.ARCHIVED) return AuditAction.ARCHIVE;
    return AuditAction.UPDATE;
  }
}
