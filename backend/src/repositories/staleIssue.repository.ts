import prisma from "../lib/prisma.js";

const MAX_WARNINGS = 5

export const findStaleIssues = async () => {
    const STALE_DAYS = Number(process.env.STALE_DAYS) || 7
    const cutoff = new Date()

    cutoff.setDate(cutoff.getDate() - STALE_DAYS)

    return prisma.issue.findMany({
        where: {
            issue_status: { not: "done" },
            assignee_id: { not: null },
            last_activity_at: { lt: cutoff },
            warning_count: { lt: MAX_WARNINGS },
        },
        include: {
            assignee: { select: { user_id: true, user_name: true } },
            project: { select: { project_id: true, project_name: true } },
        },
    })
}