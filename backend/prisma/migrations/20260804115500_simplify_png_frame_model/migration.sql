/*
  Warnings:

  - You are about to drop the column `avatarPosition` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `customConfigJson` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `footerStyle` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `frameType` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `layoutPreset` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `logoPosition` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `showAddress` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `showPhone` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `showSocials` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `Frame` table. All the data in the column will be lost.
  - Made the column `overlayPngUrl` on table `Frame` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Frame" DROP COLUMN IF EXISTS "avatarPosition",
DROP COLUMN IF EXISTS "customConfigJson",
DROP COLUMN IF EXISTS "footerStyle",
DROP COLUMN IF EXISTS "frameType",
DROP COLUMN IF EXISTS "layoutPreset",
DROP COLUMN IF EXISTS "logoPosition",
DROP COLUMN IF EXISTS "primaryColor",
DROP COLUMN IF EXISTS "secondaryColor",
DROP COLUMN IF EXISTS "showAddress",
DROP COLUMN IF EXISTS "showPhone",
DROP COLUMN IF EXISTS "showSocials",
DROP COLUMN IF EXISTS "textColor";

-- Make overlayPngUrl required if null entries exist
UPDATE "Frame" SET "overlayPngUrl" = 'https://res.cloudinary.com/dksdc3q6y/image/upload/v1711111111/brandflow/frames/sample_frame.png' WHERE "overlayPngUrl" IS NULL;

ALTER TABLE "Frame" ALTER COLUMN "overlayPngUrl" SET NOT NULL;
