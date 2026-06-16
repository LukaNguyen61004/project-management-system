-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityActionType" ADD VALUE 'SPRINT_UPDATED';
ALTER TYPE "ActivityActionType" ADD VALUE 'SPRINT_STATUS_CHANGED';

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "sprint_id" INTEGER;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("sprint_id") ON DELETE SET NULL ON UPDATE CASCADE;
