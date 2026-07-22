-- CreateIndex
CREATE INDEX "ActivityLog_comment_id_idx" ON "ActivityLog"("comment_id");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;
