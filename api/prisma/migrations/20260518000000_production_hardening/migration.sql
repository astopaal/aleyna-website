-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'LOGIN', 'LOGOUT', 'REFRESH_REUSE_DETECTED');

-- Drop old unique slug indexes before replacing with soft-delete-aware uniqueness.
DROP INDEX IF EXISTS "Product_slug_key";
DROP INDEX IF EXISTS "Product_slug_idx";
DROP INDEX IF EXISTS "Category_slug_key";
DROP INDEX IF EXISTS "Category_slug_idx";
DROP INDEX IF EXISTS "Document_slug_key";
DROP INDEX IF EXISTS "Document_slug_idx";

-- User hardening.
ALTER TABLE "User" DROP COLUMN IF EXISTS "refreshTokenHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "refreshTokenExpiresAt";
ALTER TABLE "User" ADD COLUMN "createdById" UUID;
ALTER TABLE "User" ADD COLUMN "updatedById" UUID;
ALTER TABLE "User" ADD COLUMN "deletedById" UUID;

-- Product price moves from decimal to minor units.
ALTER TABLE "Product" ADD COLUMN "priceCents" INTEGER;
UPDATE "Product" SET "priceCents" = ROUND("price" * 100)::INTEGER;
ALTER TABLE "Product" ALTER COLUMN "priceCents" SET NOT NULL;
ALTER TABLE "Product" DROP COLUMN "price";
ALTER TABLE "Product" ADD COLUMN "createdById" UUID;
ALTER TABLE "Product" ADD COLUMN "updatedById" UUID;
ALTER TABLE "Product" ADD COLUMN "deletedById" UUID;

ALTER TABLE "Category" ADD COLUMN "createdById" UUID;
ALTER TABLE "Category" ADD COLUMN "updatedById" UUID;
ALTER TABLE "Category" ADD COLUMN "deletedById" UUID;

ALTER TABLE "Media" ADD COLUMN "createdById" UUID;
ALTER TABLE "Media" ADD COLUMN "updatedById" UUID;
ALTER TABLE "Media" ADD COLUMN "deletedById" UUID;

ALTER TABLE "Slider" ADD COLUMN "createdById" UUID;
ALTER TABLE "Slider" ADD COLUMN "updatedById" UUID;
ALTER TABLE "Slider" ADD COLUMN "deletedById" UUID;

ALTER TABLE "Document" ADD COLUMN "createdById" UUID;
ALTER TABLE "Document" ADD COLUMN "updatedById" UUID;
ALTER TABLE "Document" ADD COLUMN "deletedById" UUID;

-- Refresh sessions support token rotation, token family invalidation, and reuse detection.
CREATE TABLE "RefreshSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenFamily" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "reusedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");
CREATE INDEX "RefreshSession_tokenFamily_idx" ON "RefreshSession"("tokenFamily");
CREATE INDEX "RefreshSession_expiresAt_idx" ON "RefreshSession"("expiresAt");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE UNIQUE INDEX "Product_slug_active_key" ON "Product"("slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Category_slug_active_key" ON "Category"("slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Document_slug_active_key" ON "Document"("slug") WHERE "deletedAt" IS NULL;
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
CREATE INDEX "Document_slug_idx" ON "Document"("slug");

ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
