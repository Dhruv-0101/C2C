/*
  Warnings:

  - You are about to drop the column `primaryFont` on the `BrandKit` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryFont` on the `BrandKit` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `TemplateCategory` table. All the data in the column will be lost.
  - You are about to drop the `BrandAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BrandAsset" DROP CONSTRAINT "BrandAsset_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "Template_category_idx";

-- AlterTable
ALTER TABLE "BrandKit" DROP COLUMN "primaryFont",
DROP COLUMN "secondaryFont";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "icon",
DROP COLUMN "isSystem";

-- AlterTable
ALTER TABLE "Frame" DROP COLUMN "isSystem";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "TemplateCategory" DROP COLUMN "icon";

-- DropTable
DROP TABLE "BrandAsset";

-- DropTable
DROP TABLE "Notification";

-- DropEnum
DROP TYPE "AssetType";

-- DropEnum
DROP TYPE "NotificationType";
