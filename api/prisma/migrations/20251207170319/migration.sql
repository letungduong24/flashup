-- CreateTable
CREATE TABLE "StudyCount" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "newCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "day" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyCount_user_id_idx" ON "StudyCount"("user_id");

-- CreateIndex
CREATE INDEX "StudyCount_day_idx" ON "StudyCount"("day");

-- CreateIndex
CREATE UNIQUE INDEX "StudyCount_user_id_day_key" ON "StudyCount"("user_id", "day");

-- AddForeignKey
ALTER TABLE "StudyCount" ADD CONSTRAINT "StudyCount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
