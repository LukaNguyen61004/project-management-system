import type { Issue, Sprint } from "@prisma/client"

type IssueWithUsers = Issue & {
    assignee?: { user_id: number; user_name: string | null } | null // du lieu lay dc co the co tt cua assignee
}

export function buildSprintSummaryData(sprint: Sprint, issues: IssueWithUsers[]) {
    const byStatus = {
        done: issues.filter((i) => i.issue_status === "done"),
        in_review: issues.filter((i) => i.issue_status === "in_review"),
        in_progress: issues.filter((i) => i.issue_status === "in_progress"),
        todo: issues.filter((i) => i.issue_status === "todo"),
    }

    const total = issues.length;
    const doneCount = byStatus.done.length;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const toIssueBrief = (i: IssueWithUsers) => ({
        key: i.issue_key,
        name: i.issue_name,
        status: i.issue_status,
        priority: i.issue_priority,
        type: i.issue_type,
        assignee: i.assignee?.user_name ?? "Unassigned",
        review_rejects: i.review_reject_count,
        warnings: i.warning_count,
    });

    const assigneeMap = new Map<string, { done: number, imcomplete: number }>();
    for (const issue of issues) {
        const name = issue.assignee?.user_name ?? "Unassigned";
        const entry = assigneeMap.get(name) ?? { done: 0, imcomplete: 0 };
        if (issue.issue_status === "done") entry.done++;
        else entry.imcomplete++;
        assigneeMap.set(name, entry);
    }

    const durationDays =
        sprint.start_date && sprint.end_date
            ? Math.ceil(
                (sprint.end_date.getTime() - sprint.start_date.getTime()) / (1000 * 60 * 60 * 24)
            ) : null;

    return {
        sprint: {
            name: sprint.sprint_name,
            description: sprint.description,
            start_date: sprint.start_date?.toISOString() ?? null,
            end_date: sprint.end_date?.toISOString() ?? null,
            duration_days: durationDays,
        },
        stats: {
            total,
            done: doneCount,
            in_review: byStatus.in_review.length,
            in_progress: byStatus.in_progress.length,
            todo: byStatus.todo.length,
            completion_rate: `${completionRate}%`,
        },
        completed_issues: byStatus.done.map(toIssueBrief),
        incomplete_issues: [
            ...byStatus.in_review,
            ...byStatus.in_progress,
            ...byStatus.todo,
        ].map(toIssueBrief),
        assignee_stats: Object.fromEntries(assigneeMap),
        quality_flags: issues
            .filter((i) => i.review_reject_count > 0 || i.warning_count > 0)
            .map(toIssueBrief),
    };
}