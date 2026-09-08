import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Prisma, PublishStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { paginationMeta } from '../common/utils/paginate';
import { slugify } from '../common/utils/slugify';
import { type SupportedLocale } from '../common/utils/locale';
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

  findPublished(query: ProductFilterDto, locale?: SupportedLocale) {
    return this.findMany(query, {
      deletedAt: null,
      status: PublishStatus.PUBLISHED,
    }, locale);
  }

  findAllForAdmin(query: ProductFilterDto) {
    return this.findMany(query, { deletedAt: null });
  }

  async findPublishedBySlug(slug: string, locale?: SupportedLocale) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { translations: { path: ['en', 'slug'], equals: slug } },
          { translations: { path: ['de', 'slug'], equals: slug } },
        ],
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
      },
      include: this.includeRelations(),
    });
    if (!product) throw new NotFoundException('Product not found');
    return serializeProduct(product, locale);
  }

  async create(dto: CreateProductDto, actorId?: string) {
    let translations = dto.translations as any;
    if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
      translations = { ...translations };
      for (const locale in translations) {
        if (translations[locale]?.name && !translations[locale]?.slug) {
          translations[locale].slug = slugify(translations[locale].name);
        }
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        description: dto.description,
        translations: translations,
        stock: dto.stock,
        priceCents: dto.priceCents,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        isFeatured: dto.isFeatured ?? false,
        status: dto.status,
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
        variants: dto.variants?.length
          ? {
              create: dto.variants.map((v) => ({
                name: v.name,
                slug: v.slug || slugify(`${dto.name}-${v.name}`),
                description: v.description,
                stock: v.stock,
                priceCents: v.priceCents,
                images: v.imageIds?.length
                  ? {
                      create: v.imageIds.map((mediaId, index) => ({
                        mediaId,
                        sortOrder: index,
                        isPrimary: index === 0,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: this.includeRelations(),
    });
    return serializeProduct(product);
  }

  async update(id: string, dto: UpdateProductDto, actorId?: string) {
    let translations = dto.translations as any;
    if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
      translations = { ...translations };
      for (const locale in translations) {
        if (translations[locale]?.name && !translations[locale]?.slug) {
          translations[locale].slug = slugify(translations[locale].name);
        }
      }
    }

    const before = await this.ensureExists(id);
    const product = await this.prisma.$transaction(async (tx) => {
      if (dto.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
      }
      if (dto.imageIds) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
      }
      if (dto.variants !== undefined) {
        const variantIdsToKeep = dto.variants.filter((v) => v.id).map((v) => v.id as string);
        await tx.productVariant.deleteMany({
          where: { productId: id, id: { notIn: variantIdsToKeep } },
        });

        for (const variant of dto.variants) {
          if (variant.id) {
            if (variant.imageIds) {
              await tx.productVariantMedia.deleteMany({ where: { productVariantId: variant.id } });
            }
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                slug: variant.slug,
                description: variant.description,
                stock: variant.stock,
                priceCents: variant.priceCents,
                images: variant.imageIds
                  ? {
                      create: variant.imageIds.map((mediaId, index) => ({
                        mediaId,
                        sortOrder: index,
                        isPrimary: index === 0,
                      })),
                    }
                  : undefined,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: variant.name || 'Yeni Varyant',
                slug: variant.slug || slugify(`${dto.name || before.name}-${variant.name || 'yeni'}`),
                description: variant.description,
                stock: variant.stock ?? 0,
                priceCents: variant.priceCents ?? 0,
                images: variant.imageIds?.length
                  ? {
                      create: variant.imageIds.map((mediaId, index) => ({
                        mediaId,
                        sortOrder: index,
                        isPrimary: index === 0,
                      })),
                    }
                  : undefined,
              },
            });
          }
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          translations: translations,
          stock: dto.stock,
          priceCents: dto.priceCents,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          isFeatured: dto.isFeatured,
          status: dto.status,
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
    locale?: SupportedLocale,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const categoryIds = query.categorySlug
      ? await this.findCategoryAndDescendantIds(query.categorySlug, locale)
      : undefined;
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
          some: { categoryId: { in: categoryIds } },
        },
      }),
      ...(query.isFeatured !== undefined && {
        isFeatured: query.isFeatured === 'true' || query.isFeatured === true,
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

    return { items: items.map((item) => serializeProduct(item, locale)), meta: paginationMeta(page, limit, total) };
  }

  private async findCategoryAndDescendantIds(
    slug: string,
    locale?: SupportedLocale,
  ) {
    const slugFilters: Prisma.CategoryWhereInput[] = [{ slug }];

    if (locale) {
      slugFilters.push({
        translations: {
          path: [locale, 'slug'],
          equals: slug,
        },
      });
    }

    const category = await this.prisma.category.findFirst({
      where: {
        deletedAt: null,
        OR: slugFilters,
      },
      select: { id: true },
    });

    if (!category) return [];

    const ids = [category.id];
    let parentIds = [category.id];

    while (parentIds.length > 0) {
      const children = await this.prisma.category.findMany({
        where: { parentId: { in: parentIds }, deletedAt: null },
        select: { id: true },
      });
      parentIds = children.map((child) => child.id);
      ids.push(...parentIds);
    }

    return ids;
  }

  private includeRelations() {
    return {
      categories: { include: { category: true } },
      images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        include: { media: true },
      },
      variants: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' as const },
        include: {
          images: {
            orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
            include: { media: true },
          },
        },
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
