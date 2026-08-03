/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `coordinatesJson` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `Template` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT IF EXISTS "Template_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT IF EXISTS "Template_styleId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Template_categoryId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Template_styleId_idx";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN IF EXISTS "categoryId",
DROP COLUMN IF EXISTS "coordinatesJson",
DROP COLUMN IF EXISTS "styleId";
