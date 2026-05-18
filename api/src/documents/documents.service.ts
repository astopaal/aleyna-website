import { Injectable } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { paginationMeta } from '../common/utils/paginate';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.document.findMany({
      where: { deletedAt: null, status: PublishStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { media: true },
    });
  }

  async findAllForAdmin(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { deletedAt: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: { media: true },
      }),
      this.prisma.document.count({ where }),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  }

  create(dto: CreateDocumentDto, actorId?: string) {
    return this.prisma.document.create({
      data: {
        ...dto,
        slug: dto.slug ?? slugify(dto.title),
        createdById: actorId,
        updatedById: actorId,
      },
      include: { media: true },
    });
  }

  update(id: string, dto: UpdateDocumentDto, actorId?: string) {
    return this.prisma.document.update({
      where: { id },
      data: { ...dto, updatedById: actorId },
      include: { media: true },
    });
  }

  updateStatus(id: string, dto: UpdateStatusDto, actorId?: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
      include: { media: true },
    });
  }

  softDelete(id: string, actorId?: string) {
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId },
    });
  }
}
