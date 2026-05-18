import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ImageProcessorService } from './processors/image-processor.service';
import { S3StorageService } from './storage/s3-storage.service';
import { STORAGE_SERVICE } from './storage/storage.interface';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    ImageProcessorService,
    { provide: STORAGE_SERVICE, useClass: S3StorageService },
  ],
  exports: [MediaService],
})
export class MediaModule {}
