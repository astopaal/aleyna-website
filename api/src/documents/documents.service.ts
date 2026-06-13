import { Injectable } from '@nestjs/common';
import { AuditAction, PublishStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { paginationMeta } from '../common/utils/paginate';
import { getLocalizedFields, type SupportedLocale } from '../common/utils/locale';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async findPublished(locale?: SupportedLocale) {
    const documents = await this.prisma.document.findMany({
      where: { deletedAt: null, status: PublishStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { media: true },
    });

    return documents.map((document) => this.serializeDocument(document, locale));
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
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.document.findUnique({ where: { id }, include: { media: true } });
      const document = await tx.document.update({
      where: { id },
      data: { ...dto, updatedById: actorId },
      include: { media: true },
    });
      await this.auditService.log({
        actorId,
        action: AuditAction.UPDATE,
        entityType: 'Document',
        entityId: id,
        metadata: this.auditService.buildChangeMetadata(before ?? {}, document),
      });
      return document;
    });
  }

  updateStatus(id: string, dto: UpdateStatusDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.document.findUnique({ where: { id }, include: { media: true } });
      const document = await tx.document.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
      include: { media: true },
    });
      await this.auditService.log({
        actorId,
        action: this.statusAuditAction(dto.status),
        entityType: 'Document',
        entityId: id,
        metadata: this.auditService.buildChangeMetadata(before ?? {}, document),
      });
      return document;
    });
  }

  softDelete(id: string, actorId?: string) {
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId },
    });
  }

  private statusAuditAction(status: PublishStatus) {
    if (status === PublishStatus.PUBLISHED) return AuditAction.PUBLISH;
    if (status === PublishStatus.ARCHIVED) return AuditAction.ARCHIVE;
    return AuditAction.UPDATE;
  }

  private serializeDocument(document: any, locale?: SupportedLocale) {
    const fields = locale ? getLocalizedFields(document.translations, locale) : {};

    return {
      ...document,
      title: fields.title || document.title,
      description: fields.description ?? document.description,
      seoTitle: fields.seoTitle || document.seoTitle,
      seoDescription: fields.seoDescription ?? document.seoDescription,
    };
  }
}
