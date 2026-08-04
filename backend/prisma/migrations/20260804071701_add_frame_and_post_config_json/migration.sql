-- AlterTable
ALTER TABLE "Frame" ADD COLUMN     "configJson" JSONB;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "userConfigJson" JSONB;
