import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDIT_META_KEY = 'auditMeta';

export type AuditMeta = {
  action: AuditAction;
  entityType: string;
};

export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_META_KEY, meta);
