-- Convert existing stories to tasks before dropping the enum value
UPDATE "Issue" SET "issue_type" = 'task' WHERE "issue_type" = 'story';

CREATE TYPE "IssueType_new" AS ENUM ('task', 'bug', 'subtask');

ALTER TABLE "Issue" ALTER COLUMN "issue_type" DROP DEFAULT;
ALTER TABLE "Issue" ALTER COLUMN "issue_type" TYPE "IssueType_new" USING ("issue_type"::text::"IssueType_new");
ALTER TYPE "IssueType" RENAME TO "IssueType_old";
ALTER TYPE "IssueType_new" RENAME TO "IssueType";
DROP TYPE "IssueType_old";
ALTER TABLE "Issue" ALTER COLUMN "issue_type" SET DEFAULT 'task'::"IssueType";

ALTER TABLE "Issue" DROP COLUMN "estimate";
