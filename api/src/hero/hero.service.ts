import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentTargetType, Prisma } from '@prisma/client';
import { getLocalizedFields, type SupportedLocale } from '../common/utils/locale';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';

const heroInclude = {
  media: true,
  category: true,
  targetProduct: true,
  targetCategory: true,
} satisfies Prisma.HeroSectionInclude;

type HeroWithTargets = Prisma.HeroSectionGetPayload<{ include: typeof heroInclude }>;

@Injectable()
export class HeroService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAdmin(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.heroSection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          ...heroInclude,
        },
      }),
      this.prisma.heroSection.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActiveHeroSections(locale: SupportedLocale) {
    // This is the public endpoint logic
    const sections = await this.prisma.heroSection.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
      include: heroInclude,
    });

    // For each section, we want to fetch 3 random products from the assigned category
    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        let products: any[] = [];
        if (section.categoryId) {
          // Fetch some products for this category
          const categoryProducts = await this.prisma.productCategory.findMany({
            where: { categoryId: section.categoryId },
            take: 10, // Get a pool to pick from
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    include: { media: true },
                    take: 1
                  }
                }
              }
            }
          });
          
          // Randomly pick 3
          const shuffled = categoryProducts.sort(() => 0.5 - Math.random());
          products = shuffled.slice(0, 3).map(cp => cp.product);
        }

        return {
          ...section,
          target: this.serializeTarget(section, locale),
          hoverProducts: products
        };
      })
    );

    return sectionsWithProducts;
  }

  async create(dto: CreateHeroSectionDto, userId: string) {
    return this.prisma.heroSection.create({
      data: {
        ...dto,
        ...this.buildTargetData(dto),
        createdById: userId,
      },
      include: heroInclude
    });
  }

  async update(id: string, dto: UpdateHeroSectionDto, userId: string) {
    await this.ensureExists(id);
    return this.prisma.heroSection.update({
      where: { id },
      data: {
        ...dto,
        ...this.buildTargetData(dto, true),
        updatedById: userId,
      },
      include: heroInclude
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string) {
    await this.ensureExists(id);
    return this.prisma.heroSection.update({
      where: { id },
      data: {
        status: dto.status,
        updatedById: userId,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.ensureExists(id);
    return this.prisma.heroSection.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.heroSection.findUnique({
      where: { id, deletedAt: null },
    });
    if (!item) {
      throw new NotFoundException(`Hero section with ID ${id} not found`);
    }
    return item;
  }

  private buildTargetData(
    dto: Pick<CreateHeroSectionDto, 'targetType' | 'targetProductId' | 'targetCategoryId' | 'customUrl' | 'linkUrl'>,
    partial = false,
  ) {
    if (
      partial &&
      dto.targetType === undefined &&
      dto.targetProductId === undefined &&
      dto.targetCategoryId === undefined &&
      dto.customUrl === undefined &&
      dto.linkUrl === undefined
    ) {
      return {};
    }

    const targetType = dto.targetType ?? (dto.linkUrl ? ContentTargetType.CUSTOM : ContentTargetType.NONE);
    const customUrl = dto.customUrl ?? dto.linkUrl;

    return {
      targetType,
      targetProductId: targetType === ContentTargetType.PRODUCT ? dto.targetProductId : null,
      targetCategoryId: targetType === ContentTargetType.CATEGORY ? dto.targetCategoryId : null,
      customUrl: targetType === ContentTargetType.CUSTOM ? customUrl : null,
      linkUrl: targetType === ContentTargetType.CUSTOM ? customUrl : null,
    };
  }

  private serializeTarget(section: HeroWithTargets, locale: SupportedLocale) {
    if (section.targetType === ContentTargetType.PRODUCT && section.targetProduct) {
      const fields = getLocalizedFields(section.targetProduct.translations, locale);
      return {
        type: ContentTargetType.PRODUCT,
        product: {
          id: section.targetProduct.id,
          name: fields.name || section.targetProduct.name,
          slug: fields.slug || section.targetProduct.slug,
        },
      };
    }

    if (section.targetType === ContentTargetType.CATEGORY && section.targetCategory) {
      const fields = getLocalizedFields(section.targetCategory.translations, locale);
      return {
        type: ContentTargetType.CATEGORY,
        category: {
          id: section.targetCategory.id,
          name: fields.name || section.targetCategory.name,
          slug: fields.slug || section.targetCategory.slug,
        },
      };
    }

    const customUrl = section.customUrl || section.linkUrl;
    if (section.targetType === ContentTargetType.CUSTOM && customUrl) {
      return { type: ContentTargetType.CUSTOM, customUrl };
    }

    return { type: ContentTargetType.NONE };
  }
}
