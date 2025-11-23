-- AlterTable
-- Make eventId required (all lists should now have an eventId after data migration)
ALTER TABLE "List" ALTER COLUMN "eventId" SET NOT NULL;

