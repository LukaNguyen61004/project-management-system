-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "parent_issue_id" INTEGER;

-- CreateIndex
CREATE INDEX "Issue_parent_issue_id_idx" ON "Issue"("parent_issue_id");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_parent_issue_id_fkey" FOREIGN KEY ("parent_issue_id") REFERENCES "Issue"("issue_id") ON DELETE SET NULL ON UPDATE CASCADE;
