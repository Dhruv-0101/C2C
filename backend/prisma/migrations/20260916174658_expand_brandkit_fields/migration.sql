-- AlterTable
ALTER TABLE "BrandKit" ADD COLUMN     "businessUsps" TEXT,
ADD COLUMN     "captionLanguage" TEXT DEFAULT 'English',
ADD COLUMN     "gmbReviewUrl" TEXT,
ADD COLUMN     "linkedinHandle" TEXT,
ADD COLUMN     "primaryFont" TEXT,
ADD COLUMN     "secondaryFont" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "twitterHandle" TEXT,
ADD COLUMN     "upiQrUrl" TEXT,
ADD COLUMN     "upiVpa" TEXT,
ADD COLUMN     "workingHours" TEXT,
ADD COLUMN     "youtubeHandle" TEXT;
