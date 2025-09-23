/*
  Warnings:

  - You are about to drop the column `fileKey` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "fileKey";

-- CreateTable
CREATE TABLE "_ChatFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChatFiles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChatFiles_B_index" ON "_ChatFiles"("B");

-- AddForeignKey
ALTER TABLE "_ChatFiles" ADD CONSTRAINT "_ChatFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatFiles" ADD CONSTRAINT "_ChatFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
