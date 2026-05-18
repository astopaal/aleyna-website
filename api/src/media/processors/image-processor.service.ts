import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width?: number;
  height?: number;
};

@Injectable()
export class ImageProcessorService {
  constructor(private readonly configService: ConfigService) {}

  async toWebp(file: Express.Multer.File): Promise<ProcessedImage> {
    const quality = this.configService.get<number>('WEBP_QUALITY', 82);
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    const buffer = await image.webp({ quality }).toBuffer();

    return {
      buffer,
      mimeType: 'image/webp',
      extension: 'webp',
      width: metadata.width,
      height: metadata.height,
    };
  }
}
