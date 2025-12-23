/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `transcript` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "audioUrl",
DROP COLUMN "transcript",
ADD COLUMN     "paragraph" TEXT;
