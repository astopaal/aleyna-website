CREATE TYPE "ContentTargetType" AS ENUM ('NONE', 'PRODUCT', 'CATEGORY', 'CUSTOM');

ALTER TABLE "Slider"
  ADD COLUMN "targetType" "ContentTargetType" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "targetProductId" UUID,
  ADD COLUMN "targetCategoryId" UUID,
  ADD COLUMN "customUrl" TEXT;

ALTER TABLE "HeroSection"
  ADD COLUMN "targetType" "ContentTargetType" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "targetProductId" UUID,
  ADD COLUMN "targetCategoryId" UUID,
  ADD COLUMN "customUrl" TEXT;

UPDATE "Slider"
SET "targetType" = 'CUSTOM',
    "customUrl" = "linkUrl"
WHERE "linkUrl" IS NOT NULL AND "linkUrl" <> '';

UPDATE "HeroSection"
SET "targetType" = 'CUSTOM',
    "customUrl" = "linkUrl"
WHERE "linkUrl" IS NOT NULL AND "linkUrl" <> '';

CREATE INDEX "Slider_targetType_idx" ON "Slider"("targetType");
CREATE INDEX "Slider_targetProductId_idx" ON "Slider"("targetProductId");
CREATE INDEX "Slider_targetCategoryId_idx" ON "Slider"("targetCategoryId");
CREATE INDEX "HeroSection_targetType_idx" ON "HeroSection"("targetType");
CREATE INDEX "HeroSection_targetProductId_idx" ON "HeroSection"("targetProductId");
CREATE INDEX "HeroSection_targetCategoryId_idx" ON "HeroSection"("targetCategoryId");

ALTER TABLE "Slider"
  ADD CONSTRAINT "Slider_targetProductId_fkey"
  FOREIGN KEY ("targetProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Slider"
  ADD CONSTRAINT "Slider_targetCategoryId_fkey"
  FOREIGN KEY ("targetCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HeroSection"
  ADD CONSTRAINT "HeroSection_targetProductId_fkey"
  FOREIGN KEY ("targetProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HeroSection"
  ADD CONSTRAINT "HeroSection_targetCategoryId_fkey"
  FOREIGN KEY ("targetCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
