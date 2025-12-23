/*
  Warnings:

  - You are about to drop the column `is_remembered` on the `Flashcard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Flashcard" DROP COLUMN "is_remembered",
ADD COLUMN     "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lapseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextReview" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'new';

-- CreateIndex
CREATE INDEX "Flashcard_status_idx" ON "Flashcard"("status");

-- CreateIndex
CREATE INDEX "Flashcard_nextReview_idx" ON "Flashcard"("nextReview");
