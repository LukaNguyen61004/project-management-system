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

    // Moc Overdue = end_date sprint ( khong co thi dung hom nay)
    const deadline = sprint.end_date ?? new Date()
    const isOverdue = (i: IssueWithUsers) =>
        !!i.due_date &&
        i.issue_status !== "done" &&
        i.due_date.getTime() < deadline.getTime()

    // Rút gọn 1 issue để đưa vào JSON / AI 
    const toIssueBrief = (i: IssueWithUsers) => ({
        key: i.issue_key,
        name: i.issue_name,
        status: i.issue_status,
        priority: i.issue_priority,
        type: i.issue_type,
        assignee: i.assignee?.user_name ?? "Unassigned",
        estimate: i.estimate ?? null,
        due_date: i.due_date?.toISOString() ?? null,
        overdue: isOverdue(i),
        review_rejects: i.review_reject_count,
        warnings: i.warning_count,
    });

    const assigneeMap = new Map<string, { done: number, incomplete: number, incomplete_keys: string[] }>();
    for (const issue of issues) {
        const name = issue.assignee?.user_name ?? "Unassigned";
        const entry = assigneeMap.get(name) ?? { done: 0, incomplete: 0, incomplete_keys: [], };

        if (issue.issue_status === "done") {
            entry.done++
        } else {
            entry.incomplete++
            entry.incomplete_keys.push(issue.issue_key)
        }

        assigneeMap.set(name, entry);
    }

    const member_progress = [...assigneeMap.entries()].map(([name, v]) => {
        const assigned = v.done + v.incomplete
        return {
            name,
            assigned,
            done: v.done,
            incomplete: v.incomplete,
            completion_pct: assigned
                ? Math.round((v.done / assigned) * 100)
                : 0,
            incomplete_keys: v.incomplete_keys, // list key chưa xong
        }
    })
    const overdueIssues = issues.filter(isOverdue)

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
        assignee_stats: Object.fromEntries(
            [...assigneeMap.entries()].map(([name, v]) => [
                name,
                { done: v.done, incomplete: v.incomplete },
            ])
        ),
        member_progress,
        manager_stats: {
            total,
            done: doneCount,
            completion_rate: `${completionRate}%`,
            overdue_count: overdueIssues.length,
            overdue_keys: overdueIssues.map((i) => i.issue_key),
            unassigned_count: issues.filter((i) => !i.assignee_id).length,
        },
        quality_flags: issues
            .filter((i) => i.review_reject_count > 0 || i.warning_count > 0)
            .map(toIssueBrief),
    };
}