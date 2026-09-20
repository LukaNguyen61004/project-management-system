-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "sprint_close_issue_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
