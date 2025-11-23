-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN "hasAdvanced" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debt_fromUserId_idx" ON "Debt"("fromUserId");

-- CreateIndex
CREATE INDEX "Debt_toUserId_idx" ON "Debt"("toUserId");

-- CreateIndex
CREATE INDEX "Debt_itemId_idx" ON "Debt"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Debt_itemId_fromUserId_toUserId_key" ON "Debt"("itemId", "fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

