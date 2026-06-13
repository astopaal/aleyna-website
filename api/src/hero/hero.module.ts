import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminHeroController } from './admin-hero.controller';
import { PublicHeroController } from './public-hero.controller';
import { HeroService } from './hero.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminHeroController, PublicHeroController],
  providers: [HeroService],
})
export class HeroModule {}
