-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebookPageUrl" TEXT,
ADD COLUMN     "socialOnboardingStatus" TEXT DEFAULT 'NOT_SUBMITTED';
