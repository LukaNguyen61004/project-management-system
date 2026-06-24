/*
  Warnings:

  - The values [issue_updated,sprint_created] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `user_id` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `receiver_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('issue_assigned', 'comment_added', 'sprint_started', 'sprint_completed', 'project_invitation', 'stale_issue_warning');
ALTER TABLE "Notification" ALTER COLUMN "notifi_type" TYPE "NotificationType_new" USING ("notifi_type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropIndex
DROP INDEX "Notification_user_id_idx";

-- DropIndex
DROP INDEX "Notification_user_id_is_read_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "user_id",
ADD COLUMN     "receiver_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_receiver_id_idx" ON "Notification"("receiver_id");

-- CreateIndex
CREATE INDEX "Notification_receiver_id_is_read_idx" ON "Notification"("receiver_id", "is_read");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
