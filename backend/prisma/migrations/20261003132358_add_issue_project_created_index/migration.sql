-- CreateIndex
CREATE INDEX "Issue_project_id_issue_created_at_idx" ON "Issue"("project_id", "issue_created_at" DESC);
