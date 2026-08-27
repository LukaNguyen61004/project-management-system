UPDATE "Issue" SET "issue_priority" = 'high' WHERE "issue_priority" = 'critical';

CREATE TYPE "IssuePriority_new" AS ENUM ('low', 'medium', 'high');

ALTER TABLE "Issue" ALTER COLUMN "issue_priority" DROP DEFAULT;
ALTER TABLE "Issue" ALTER COLUMN "issue_priority" TYPE "IssuePriority_new" USING ("issue_priority"::text::"IssuePriority_new");
ALTER TYPE "IssuePriority" RENAME TO "IssuePriority_old";
ALTER TYPE "IssuePriority_new" RENAME TO "IssuePriority";
DROP TYPE "IssuePriority_old";
ALTER TABLE "Issue" ALTER COLUMN "issue_priority" SET DEFAULT 'low'::"IssuePriority";
