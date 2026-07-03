-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('image', 'link');

-- CreateTable
CREATE TABLE "IssueAttachment" (
    "attachment_id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "attachment_type" "AttachmentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueAttachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateIndex
CREATE INDEX "IssueAttachment_issue_id_idx" ON "IssueAttachment"("issue_id");

-- AddForeignKey
ALTER TABLE "IssueAttachment" ADD CONSTRAINT "IssueAttachment_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "Issue"("issue_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueAttachment" ADD CONSTRAINT "IssueAttachment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
