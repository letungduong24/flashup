-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saves" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Folder_isPublic_idx" ON "Folder"("isPublic");
