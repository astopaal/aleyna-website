import { Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });
  }

  findActiveById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, isActive: true, deletedAt: null },
    });
  }

  markLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  findAllAdmins() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdmin(dto: CreateAdminUserDto, actorId: string) {
    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        createdById: actorId,
        updatedById: actorId,
      },
      select: this.publicUserSelect(),
    });
  }

  async updateAdmin(id: string, dto: UpdateAdminUserDto, actorId: string) {
    await this.ensureAdminExists(id);
    return this.prisma.user.update({
      where: { id },
      data: { ...dto, updatedById: actorId },
      select: this.publicUserSelect(),
    });
  }

  async softDeleteAdmin(id: string, actorId: string) {
    await this.ensureAdminExists(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById: actorId,
      },
      select: this.publicUserSelect(),
    });
  }

  clearRefreshToken(id: string) {
    return this.prisma.refreshSession.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  createRefreshSession(input: {
    id?: string;
    userId: string;
    tokenFamily: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.prisma.refreshSession.create({ data: input });
  }

  findRefreshSession(id: string) {
    return this.prisma.refreshSession.findUnique({ where: { id } });
  }

  rotateRefreshSession(
    currentSessionId: string,
    input: {
      id?: string;
      userId: string;
      tokenFamily: string;
      tokenHash: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.refreshSession.update({
        where: { id: currentSessionId },
        data: { revokedAt: new Date() },
      });
      return tx.refreshSession.create({ data: input });
    });
  }

  revokeRefreshFamily(tokenFamily: string, reusedSessionId?: string) {
    return this.prisma.refreshSession.updateMany({
      where: { tokenFamily },
      data: {
        revokedAt: new Date(),
        ...(reusedSessionId ? { reusedAt: new Date() } : {}),
      },
    });
  }

  private async ensureAdminExists(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new NotFoundException('Admin user not found');
  }

  private publicUserSelect() {
    return {
      id: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
