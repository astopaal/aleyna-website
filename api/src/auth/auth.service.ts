import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditAction } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto, meta: { ipAddress?: string; userAgent?: string }) {
    const user = await this.usersService.findActiveByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const validPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!validPassword) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email, user.role, meta);
    await this.usersService.markLogin(user.id);
    await this.auditService.log({
      actorId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    return tokens;
  }

  async refresh(
    refreshToken: string,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    const user = await this.usersService.findActiveById(payload.sub);
    const session = payload.sid
      ? await this.usersService.findRefreshSession(payload.sid)
      : null;

    if (!user || !session || session.tokenFamily !== payload.family) {
      throw new UnauthorizedException();
    }

    const validRefreshToken = await argon2.verify(session.tokenHash, refreshToken);
    if (!validRefreshToken || session.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    if (session.revokedAt) {
      await this.usersService.revokeRefreshFamily(
        session.tokenFamily,
        session.id,
      );
      await this.auditService.log({
        actorId: user.id,
        action: AuditAction.REFRESH_REUSE_DETECTED,
        entityType: 'RefreshSession',
        entityId: session.id,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    return this.issueTokens(
      user.id,
      user.email,
      user.role,
      meta,
      session.id,
      session.tokenFamily,
    );
  }

  async logout(userId: string, meta?: { ipAddress?: string; userAgent?: string }) {
    await this.usersService.clearRefreshToken(userId);
    await this.auditService.log({
      actorId: userId,
      action: AuditAction.LOGOUT,
      entityType: 'User',
      entityId: userId,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    return { success: true };
  }

  private async issueTokens(
    id: string,
    email: string,
    role: JwtPayload['role'],
    meta: { ipAddress?: string; userAgent?: string },
    currentSessionId?: string,
    tokenFamily: string = randomUUID(),
  ) {
    const sessionId = randomUUID();
    const payload: JwtPayload = {
      sub: id,
      email,
      role,
      sid: sessionId,
      family: tokenFamily,
    };
    const accessTokenTtl = this.configService.getOrThrow<string>('JWT_ACCESS_TTL');
    const refreshTokenTtl = this.configService.getOrThrow<string>('JWT_REFRESH_TTL');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTokenTtl as never,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenTtl as never,
      }),
    ]);

    const refreshTokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (currentSessionId) {
      await this.usersService.rotateRefreshSession(currentSessionId, {
        id: sessionId,
        userId: id,
        tokenFamily,
        tokenHash: refreshTokenHash,
        expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      });
    } else {
      await this.usersService.createRefreshSession({
        id: sessionId,
        userId: id,
        tokenFamily,
        tokenHash: refreshTokenHash,
        expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      });
    }

    return {
      accessToken,
      refreshToken,
      user: { id, email, role },
    };
  }
}
