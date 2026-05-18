import { Module } from '@nestjs/common';
import { AdminSlidersController } from './admin-sliders.controller';
import { PublicSlidersController } from './public-sliders.controller';
import { SlidersService } from './sliders.service';

@Module({
  controllers: [AdminSlidersController, PublicSlidersController],
  providers: [SlidersService],
})
export class SlidersModule {}
