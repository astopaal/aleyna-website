import { Module } from '@nestjs/common';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoriesService } from './categories.service';
import { PublicCategoriesController } from './public-categories.controller';

@Module({
  controllers: [AdminCategoriesController, PublicCategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
