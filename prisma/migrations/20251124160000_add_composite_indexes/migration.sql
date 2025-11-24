-- CreateIndex (composites pour optimiser les requêtes complexes)
CREATE INDEX IF NOT EXISTS "Event_creatorId_createdAt_idx" ON "Event"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "List_eventId_userId_idx" ON "List"("eventId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Contribution_userId_createdAt_idx" ON "Contribution"("userId", "createdAt");

