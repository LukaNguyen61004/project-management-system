import "dotenv/config";
import {
  PrismaClient,
  IssueStatus,
  IssueType,
  IssuePriority,
} from "@prisma/client";

const prisma = new PrismaClient();
/** Phase 4: raise this (e.g. 2000). Script only inserts the missing rows. */
const TARGET = 2000;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function main() {
  const project = await prisma.project.findUnique({
    where: { project_key: "PERF" },
  });
  const reporter = await prisma.user.findUnique({
    where: { user_email: "perf0@seed.local" },
  });
  if (!project || !reporter) {
    throw new Error("Thiếu project PERF hoặc user perf0@seed.local");
  }

  const already = await prisma.issue.count({
    where: { project_id: project.project_id },
  });
  if (already >= TARGET) {
    console.log("đã đủ", already);
    return;
  }

  const statuses = [
    IssueStatus.todo,
    IssueStatus.in_progress,
    IssueStatus.in_review,
    IssueStatus.done,
  ];
  const priorities = [
    IssuePriority.low,
    IssuePriority.medium,
    IssuePriority.high,
  ];
  const types = [IssueType.task, IssueType.bug];

  const rows = [];
  for (let n = already + 1; n <= TARGET; n++) {
    rows.push({
      project_id: project.project_id,
      issue_key: `PERF-${n}`,
      issue_name: `Baseline issue ${n}`,
      issue_description: `Phase 4 seed ${n}`,
      issue_type: pick(types),
      issue_status: pick(statuses),
      issue_priority: pick(priorities),
      reporter_id: reporter.user_id,
      assignee_id: Math.random() < 0.2 ? null : reporter.user_id,
    });
  }

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    await prisma.issue.createMany({ data: rows.slice(i, i + BATCH) });
    console.log("inserted", Math.min(i + BATCH, rows.length), "/", rows.length);
  }

  const total = await prisma.issue.count({
    where: { project_id: project.project_id },
  });
  console.log("done, issues on PERF =", total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
