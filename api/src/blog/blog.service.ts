import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto, userId: string) {
    return this.prisma.blog.create({
      data: {
        ...createBlogDto,
        translations: createBlogDto.translations || {},
        createdById: userId,
      },
    });
  }

  async findAll(includeDrafts = false) {
    return this.prisma.blog.findMany({
      where: {
        deletedAt: null,
        ...(includeDrafts ? {} : { status: 'PUBLISHED' }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        media: true,
      },
    });
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { media: true },
    });
    if (!blog || blog.deletedAt) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return blog;
  }

  async findOneBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: { media: true },
    });
    if (!blog || blog.deletedAt || blog.status !== 'PUBLISHED') {
      throw new NotFoundException(`Blog with slug ${slug} not found`);
    }
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string) {
    await this.findOne(id);
    return this.prisma.blog.update({
      where: { id },
      data: {
        ...updateBlogDto,
        translations: updateBlogDto.translations || undefined,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);
    return this.prisma.blog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }
}
