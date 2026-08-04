-- AlterTable
ALTER TABLE "BrandKit" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Frame" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frameType" TEXT NOT NULL DEFAULT 'DYNAMIC',
    "overlayPngUrl" TEXT,
    "layoutPreset" TEXT,
    "logoPosition" TEXT NOT NULL DEFAULT 'TOP_LEFT',
    "avatarPosition" TEXT NOT NULL DEFAULT 'NONE',
    "footerStyle" TEXT NOT NULL DEFAULT 'SOLID_BAR',
    "primaryColor" TEXT NOT NULL DEFAULT '#0B0F17',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "textColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "showAddress" BOOLEAN NOT NULL DEFAULT true,
    "showSocials" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Frame_pkey" PRIMARY KEY ("id")
);
