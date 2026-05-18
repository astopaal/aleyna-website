import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditInput = {
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue | Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(input: AuditInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata as Prisma.InputJsonValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  buildChangeMetadata(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
  ): Prisma.InputJsonValue {
    const changes: Record<string, { before: unknown; after: unknown }> = {};
    const ignored = new Set(['updatedAt']);
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of keys) {
      if (ignored.has(key)) continue;
      const previous = this.normalize(before[key]);
      const next = this.normalize(after[key]);
      if (JSON.stringify(previous) !== JSON.stringify(next)) {
        changes[key] = { before: previous, after: next };
      }
    }

    return { changes } as Prisma.InputJsonValue;
  }

  private normalize(value: unknown): unknown {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'bigint') return value.toString();
    if (value && typeof value === 'object' && 'toString' in value) {
      const ctor = value.constructor?.name;
      if (ctor === 'Decimal') return value.toString();
    }
    return value;
  }
}
