-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "estimate" INTEGER;
