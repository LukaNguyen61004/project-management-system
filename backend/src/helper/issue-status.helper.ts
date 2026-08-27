import { IssueStatus } from "@prisma/client";

const ORDER: IssueStatus[] = [
    IssueStatus.todo,
    IssueStatus.in_progress,
    IssueStatus.in_review,
    IssueStatus.done,
]

export function assertCanChangeIssueStatus(from: IssueStatus, to: IssueStatus, assigneeId: number | null) {
    const i = ORDER.indexOf(from)
    const j = ORDER.indexOf(to)

    if (Math.abs(i - j) !== 1) {
        throw new Error("Invalid issue status transition");
    }
    if (from === 'in_progress' && to === 'todo') {
        throw new Error("Cannout move In Progress to To Do")
    }
    if (from === IssueStatus.todo && to === IssueStatus.in_progress && assigneeId == null) {
        throw new Error("Assign someone before moving to In Progress");
    }
}

