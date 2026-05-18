import { Injectable } from '@nestjs/common';
import { AuditAction, PublishStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { paginationMeta } from '../common/utils/paginate';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';

@Injectable()
export class SlidersService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  findPublished() {
    const now = new Date();
    return this.prisma.slider.findMany({
      where: {
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { media: true },
    });
  }

  async findAllForAdmin(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { deletedAt: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.slider.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: { media: true },
      }),
      this.prisma.slider.count({ where }),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  }

  create(dto: CreateSliderDto, actorId?: string) {
    return this.prisma.slider.create({
      data: { ...dto, createdById: actorId, updatedById: actorId },
      include: { media: true },
    });
  }

  update(id: string, dto: UpdateSliderDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.slider.findUnique({ where: { id }, include: { media: true } });
      const slider = await tx.slider.update({
      where: { id },
      data: { ...dto, updatedById: actorId },
      include: { media: true },
    });
      await this.auditService.log({
        actorId,
        action: AuditAction.UPDATE,
        entityType: 'Slider',
        entityId: id,
        metadata: this.auditService.buildChangeMetadata(before ?? {}, slider),
      });
      return slider;
    });
  }

  updateStatus(id: string, dto: UpdateStatusDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.slider.findUnique({ where: { id }, include: { media: true } });
      const slider = await tx.slider.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
      include: { media: true },
    });
      await this.auditService.log({
        actorId,
        action: this.statusAuditAction(dto.status),
        entityType: 'Slider',
        entityId: id,
        metadata: this.auditService.buildChangeMetadata(before ?? {}, slider),
      });
      return slider;
    });
  }

  softDelete(id: string, actorId?: string) {
    return this.prisma.slider.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId },
    });
  }

  private statusAuditAction(status: PublishStatus) {
    if (status === PublishStatus.PUBLISHED) return AuditAction.PUBLISH;
    if (status === PublishStatus.ARCHIVED) return AuditAction.ARCHIVE;
    return AuditAction.UPDATE;
  }
}
