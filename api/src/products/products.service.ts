import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Prisma, PublishStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { paginationMeta } from '../common/utils/paginate';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { serializeProduct } from './product.serializer';

@Injectable()
export class ProductsService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  findPublished(query: ProductFilterDto) {
    return this.findMany(query, {
      deletedAt: null,
      status: PublishStatus.PUBLISHED,
    });
  }

  findAllForAdmin(query: ProductFilterDto) {
    return this.findMany(query, { deletedAt: null });
  }

  async findPublishedBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, status: PublishStatus.PUBLISHED },
      include: this.includeRelations(),
    });
    if (!product) throw new NotFoundException('Product not found');
    return serializeProduct(product);
  }

  async create(dto: CreateProductDto, actorId?: string) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        description: dto.description,
        stock: dto.stock,
        priceCents: dto.priceCents,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        createdById: actorId,
        updatedById: actorId,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
        images: dto.imageIds?.length
          ? {
              create: dto.imageIds.map((mediaId, index) => ({
                mediaId,
                sortOrder: index,
                isPrimary: index === 0,
              })),
            }
          : undefined,
      },
      include: this.includeRelations(),
    });
    return serializeProduct(product);
  }

  async update(id: string, dto: UpdateProductDto, actorId?: string) {
    const before = await this.ensureExists(id);
    const product = await this.prisma.$transaction(async (tx) => {
      if (dto.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
      }
      if (dto.imageIds) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          stock: dto.stock,
          priceCents: dto.priceCents,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          updatedById: actorId,
          categories: dto.categoryIds
            ? {
                create: dto.categoryIds.map((categoryId) => ({ categoryId })),
              }
            : undefined,
          images: dto.imageIds
            ? {
                create: dto.imageIds.map((mediaId, index) => ({
                  mediaId,
                  sortOrder: index,
                  isPrimary: index === 0,
                })),
              }
            : undefined,
        },
        include: this.includeRelations(),
      });
    });
    await this.auditService.log({
      actorId,
      action: AuditAction.UPDATE,
      entityType: 'Product',
      entityId: id,
      metadata: this.auditService.buildChangeMetadata(
        serializeProduct(before),
        serializeProduct(product),
      ),
    });
    return serializeProduct(product);
  }

  async updateStatus(id: string, dto: UpdateProductStatusDto, actorId?: string) {
    const before = await this.ensureExists(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
      include: this.includeRelations(),
    });
    await this.auditService.log({
      actorId,
      action: this.statusAuditAction(dto.status),
      entityType: 'Product',
      entityId: id,
      metadata: this.auditService.buildChangeMetadata(
        serializeProduct(before),
        serializeProduct(product),
      ),
    });
    return serializeProduct(product);
  }

  softDelete(id: string, actorId?: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId },
    });
  }

  private async findMany(
    query: ProductFilterDto,
    baseWhere: Prisma.ProductWhereInput,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductWhereInput = {
      ...baseWhere,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.categorySlug && {
        categories: {
          some: { category: { slug: query.categorySlug, deletedAt: null } },
        },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.includeRelations(),
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: items.map(serializeProduct), meta: paginationMeta(page, limit, total) };
  }

  private includeRelations() {
    return {
      categories: { include: { category: true } },
      images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        include: { media: true },
      },
    };
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: this.includeRelations(),
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private statusAuditAction(status: PublishStatus) {
    if (status === PublishStatus.PUBLISHED) return AuditAction.PUBLISH;
    if (status === PublishStatus.ARCHIVED) return AuditAction.ARCHIVE;
    return AuditAction.UPDATE;
  }
}
