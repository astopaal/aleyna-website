import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ImageProcessorService } from './processors/image-processor.service';
import { STORAGE_SERVICE } from './storage/storage.interface';
import type { StorageService } from './storage/storage.interface';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_MIME_TYPES = ['application/pdf'];

@Injectable()
export class MediaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async upload(file: Express.Multer.File, dto: UploadMediaDto, actorId?: string) {
    if (!file) throw new BadRequestException('File is required');

    const maxBytes =
      this.configService.get<number>('MAX_UPLOAD_SIZE_MB', 10) * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new PayloadTooLargeException('File size exceeds upload limit');
    }

    const isImage = IMAGE_MIME_TYPES.includes(file.mimetype);
    const isDocument = DOCUMENT_MIME_TYPES.includes(file.mimetype);
    if (!isImage && !isDocument) {
      throw new BadRequestException('Unsupported file type');
    }

    const folder = dto.folder ?? (isImage ? 'images' : 'documents');
    const processed = isImage
      ? await this.imageProcessor.toWebp(file)
      : {
          buffer: file.buffer,
          mimeType: file.mimetype,
          extension: extname(file.originalname).replace('.', '') || 'bin',
          width: undefined,
          height: undefined,
        };
    const key = `${folder}/${randomUUID()}.${processed.extension}`;
    const uploaded = await this.storageService.putObject({
      key,
      body: processed.buffer,
      contentType: processed.mimeType,
    });

    return this.prisma.media.create({
      data: {
        type: isImage ? MediaType.IMAGE : MediaType.DOCUMENT,
        bucket: uploaded.bucket,
        key: uploaded.key,
        url: uploaded.url,
        originalName: file.originalname,
        mimeType: processed.mimeType,
        extension: processed.extension,
        size: processed.buffer.length,
        width: processed.width,
        height: processed.height,
        altText: dto.altText,
        createdById: actorId,
        updatedById: actorId,
      },
    });
  }

  async softDelete(id: string, actorId?: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
      include: { productImages: true, sliders: true, documents: true },
    });
    if (!media) throw new NotFoundException('Media not found');
    if (media.productImages.length || media.sliders.length || media.documents.length) {
      throw new ConflictException('Media is still referenced');
    }

    await this.storageService.deleteObject(media.key);
    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId },
    });
  }

  findOrphans() {
    return this.prisma.media.findMany({
      where: {
        deletedAt: null,
        productImages: { none: {} },
        sliders: { none: {} },
        documents: { none: {} },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(query?: { page?: number; limit?: number }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 50;
    const where = { deletedAt: null };
    
    const [items, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
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
}
