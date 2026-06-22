-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityActionType" ADD VALUE 'ISSUE_MOVED_TO_EPIC';
ALTER TYPE "ActivityActionType" ADD VALUE 'EPIC_CREATED';
ALTER TYPE "ActivityActionType" ADD VALUE 'EPIC_UPDATED';
ALTER TYPE "ActivityActionType" ADD VALUE 'EPIC_DELETED';
