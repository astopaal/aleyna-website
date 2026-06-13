import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';

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
          media: true,
          category: true,
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

  async getActiveHeroSections() {
    // This is the public endpoint logic
    const sections = await this.prisma.heroSection.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        media: true,
        category: true,
      },
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
        createdById: userId,
      },
      include: { media: true, category: true }
    });
  }

  async update(id: string, dto: UpdateHeroSectionDto, userId: string) {
    await this.ensureExists(id);
    return this.prisma.heroSection.update({
      where: { id },
      data: {
        ...dto,
        updatedById: userId,
      },
      include: { media: true, category: true }
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
}
