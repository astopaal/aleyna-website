import { Module } from '@nestjs/common';
import { AdminDocumentsController } from './admin-documents.controller';
import { DocumentsService } from './documents.service';
import { PublicDocumentsController } from './public-documents.controller';

@Module({
  controllers: [AdminDocumentsController, PublicDocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
