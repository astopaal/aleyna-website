-- CreateTable
CREATE TABLE "HeroSection" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "translations" JSONB,
    "linkUrl" TEXT,
    "buttonText" TEXT,
    "mediaId" UUID NOT NULL,
    "categoryId" UUID,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,
    "deletedById" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSection_status_deletedAt_idx" ON "HeroSection"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "HeroSection_sortOrder_idx" ON "HeroSection"("sortOrder");

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
