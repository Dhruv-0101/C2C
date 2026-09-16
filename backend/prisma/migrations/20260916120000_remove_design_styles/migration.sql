/*
  Warnings:

  - You are about to drop the `DesignStyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `styleId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_styleId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Post_styleId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN IF EXISTS "styleId";

-- DropTable
DROP TABLE IF EXISTS "DesignStyle";
