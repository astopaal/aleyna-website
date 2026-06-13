import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AdminBlogController } from './admin-blog.controller';
import { PublicBlogController } from './public-blog.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminBlogController, PublicBlogController],
  providers: [BlogService],
})
export class BlogModule {}
