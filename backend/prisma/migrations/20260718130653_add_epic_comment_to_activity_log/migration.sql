-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "comment_id" INTEGER,
ADD COLUMN     "epic_id" INTEGER;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "Epic"("epic_id") ON DELETE SET NULL ON UPDATE CASCADE;
