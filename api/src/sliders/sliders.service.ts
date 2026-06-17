import { Injectable } from '@nestjs/common';
import { AuditAction, ContentTargetType, Prisma, PublishStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { getLocalizedFields } from '../common/utils/locale';
import { paginationMeta } from '../common/utils/paginate';
import { type SupportedLocale } from '../common/utils/locale';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';

type SliderTranslation = {
  title?: string;
  subtitle?: string | null;
  buttonText?: string | null;
};

type SliderTranslations = Partial<Record<SupportedLocale, SliderTranslation>>;

const sliderInclude = {
  media: true,
  targetProduct: true,
  targetCategory: true,
} satisfies Prisma.SliderInclude;

type SliderWithTargets = Prisma.SliderGetPayload<{ include: typeof sliderInclude }>;

@Injectable()
export class SlidersService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async findPublished(locale: SupportedLocale) {
    const now = new Date();
    const sliders = await this.prisma.slider.findMany({
      where: {
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: sliderInclude,
    });

    return sliders.map((slider) => this.serializePublicSlider(slider, locale));
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
        include: sliderInclude,
      }),
      this.prisma.slider.count({ where }),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  }

  create(dto: CreateSliderDto, actorId?: string) {
    return this.prisma.slider.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        ...this.buildTargetData(dto),
        buttonText: dto.buttonText,
        translations: this.sanitizeTranslations(dto.translations),
        mediaId: dto.mediaId,
        sortOrder: dto.sortOrder,
        createdById: actorId,
        updatedById: actorId,
      },
      include: sliderInclude,
    });
  }

  update(id: string, dto: UpdateSliderDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.slider.findUnique({ where: { id }, include: sliderInclude });
      const slider = await tx.slider.update({
      where: { id },
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        ...this.buildTargetData(dto, true),
        buttonText: dto.buttonText,
        translations: this.sanitizeTranslations(dto.translations),
        mediaId: dto.mediaId,
        sortOrder: dto.sortOrder,
        updatedById: actorId,
      },
      include: sliderInclude,
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
      const before = await tx.slider.findUnique({ where: { id }, include: sliderInclude });
      const slider = await tx.slider.update({
      where: { id },
      data: { status: dto.status, updatedById: actorId },
      include: sliderInclude,
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

  private serializePublicSlider(slider: SliderWithTargets, locale: SupportedLocale) {
    const translation = this.getTranslation(slider.translations, locale);

    return {
      ...slider,
      title: translation?.title || slider.title,
      subtitle: translation?.subtitle ?? slider.subtitle,
      buttonText: translation?.buttonText ?? slider.buttonText,
      target: this.serializeTarget(slider, locale),
      locale,
    };
  }

  private buildTargetData(
    dto: Pick<CreateSliderDto, 'targetType' | 'targetProductId' | 'targetCategoryId' | 'customUrl' | 'linkUrl'>,
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

  private serializeTarget(slider: SliderWithTargets, locale: SupportedLocale) {
    if (slider.targetType === ContentTargetType.PRODUCT && slider.targetProduct) {
      const fields = getLocalizedFields(slider.targetProduct.translations, locale);
      return {
        type: ContentTargetType.PRODUCT,
        product: {
          id: slider.targetProduct.id,
          name: fields.name || slider.targetProduct.name,
          slug: fields.slug || slider.targetProduct.slug,
        },
      };
    }

    if (slider.targetType === ContentTargetType.CATEGORY && slider.targetCategory) {
      const fields = getLocalizedFields(slider.targetCategory.translations, locale);
      return {
        type: ContentTargetType.CATEGORY,
        category: {
          id: slider.targetCategory.id,
          name: fields.name || slider.targetCategory.name,
          slug: fields.slug || slider.targetCategory.slug,
        },
      };
    }

    const customUrl = slider.customUrl || slider.linkUrl;
    if (slider.targetType === ContentTargetType.CUSTOM && customUrl) {
      return { type: ContentTargetType.CUSTOM, customUrl };
    }

    return { type: ContentTargetType.NONE };
  }

  private getTranslation(value: Prisma.JsonValue | null, locale: SupportedLocale) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

    const translations = value as SliderTranslations;
    return translations[locale];
  }

  private sanitizeTranslations(value?: SliderTranslations): Prisma.InputJsonValue | undefined {
    if (!value) return undefined;

    const translations: SliderTranslations = {};

    for (const locale of Object.keys(value) as SupportedLocale[]) {
      const translation = value[locale];
      if (!translation) continue;

      translations[locale] = {
        ...(translation.title !== undefined && { title: translation.title }),
        ...(translation.subtitle !== undefined && { subtitle: translation.subtitle }),
        ...(translation.buttonText !== undefined && { buttonText: translation.buttonText }),
      };
    }

    return translations as Prisma.InputJsonValue;
  }
}
