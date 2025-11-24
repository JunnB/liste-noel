-- CreateIndex
CREATE INDEX "Contribution_createdAt_idx" ON "Contribution"("createdAt");

-- CreateIndex
CREATE INDEX "Contribution_updatedAt_idx" ON "Contribution"("updatedAt");

-- CreateIndex
CREATE INDEX "Item_isBonus_idx" ON "Item"("isBonus");

-- CreateIndex
CREATE INDEX "Item_createdAt_idx" ON "Item"("createdAt");

-- CreateIndex
CREATE INDEX "Item_isBonus_createdAt_idx" ON "Item"("isBonus", "createdAt");

-- CreateIndex
CREATE INDEX "Debt_isSettled_idx" ON "Debt"("isSettled");

-- CreateIndex
CREATE INDEX "Debt_fromUserId_isSettled_idx" ON "Debt"("fromUserId", "isSettled");

-- CreateIndex
CREATE INDEX "Debt_toUserId_isSettled_idx" ON "Debt"("toUserId", "isSettled");

