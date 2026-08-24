-- AlterTable: Add platformResults JSON column to ScheduledPost table
ALTER TABLE "ScheduledPost" ADD COLUMN IF NOT EXISTS "platformResults" JSONB;
