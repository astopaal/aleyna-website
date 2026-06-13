import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AdminProjectController } from './admin-project.controller';
import { PublicProjectController } from './public-project.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminProjectController, PublicProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
