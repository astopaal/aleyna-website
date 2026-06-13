import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const { mediaIds, ...rest } = createProjectDto;
    
    return this.prisma.project.create({
      data: {
        ...rest,
        translations: rest.translations || {},
        createdById: userId,
        images: mediaIds ? {
          create: mediaIds.map((mediaId, index) => ({
            mediaId,
            sortOrder: index,
            isPrimary: index === 0,
          }))
        } : undefined
      },
    });
  }

  async findAll(includeDrafts = false) {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(includeDrafts ? {} : { status: 'PUBLISHED' }),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        images: {
          include: { media: true },
          orderBy: { sortOrder: 'asc' }
        },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        images: {
          include: { media: true },
          orderBy: { sortOrder: 'asc' }
        },
      },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findOneBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        images: {
          include: { media: true },
          orderBy: { sortOrder: 'asc' }
        },
      },
    });
    if (!project || project.deletedAt || project.status !== 'PUBLISHED') {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    await this.findOne(id);
    const { mediaIds, ...rest } = updateProjectDto;

    // We do a transaction to delete old images and insert new ones if mediaIds are provided
    if (mediaIds !== undefined) {
      await this.prisma.$transaction([
        this.prisma.projectMedia.deleteMany({ where: { projectId: id } }),
        this.prisma.project.update({
          where: { id },
          data: {
            ...rest,
            translations: rest.translations || undefined,
            updatedById: userId,
            images: {
              create: mediaIds.map((mediaId, index) => ({
                mediaId,
                sortOrder: index,
                isPrimary: index === 0,
              }))
            }
          }
        })
      ]);
      return this.findOne(id);
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        translations: rest.translations || undefined,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }
}
