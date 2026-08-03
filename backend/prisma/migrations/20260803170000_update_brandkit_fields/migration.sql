/*
  Warnings:

  - You are about to drop the column `accentColor` on the `BrandKit` table. All the data in the column will be lost.
  - You are about to drop the column `fontBody` on the `BrandKit` table. All the data in the column will be lost.
  - You are about to drop the column `fontHeader` on the `BrandKit` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `BrandKit` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `BrandKit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BrandKit" DROP COLUMN IF EXISTS "accentColor",
DROP COLUMN IF EXISTS "fontBody",
DROP COLUMN IF EXISTS "fontHeader",
DROP COLUMN IF EXISTS "primaryColor",
DROP COLUMN IF EXISTS "secondaryColor",
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "facebookHandle" TEXT,
ADD COLUMN IF NOT EXISTS "instagramHandle" TEXT;
