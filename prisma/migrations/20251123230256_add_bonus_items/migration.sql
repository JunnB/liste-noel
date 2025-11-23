-- AlterTable
ALTER TABLE "Item" ADD COLUMN "isBonus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "addedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Item_addedByUserId_idx" ON "Item"("addedByUserId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

