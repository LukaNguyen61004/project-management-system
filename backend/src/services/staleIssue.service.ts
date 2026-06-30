import { NotificationType } from "@prisma/client"
import { findStaleIssues } from "../repositories/staleIssue.repository.js"
import { incrementWarningCount } from "../repositories/issue.repository.js"
import { createNotificationService } from "./notification.service.js"

export const checkStaleIssuesService = async () => {
  const staleDays = Number(process.env.STALE_DAYS) || 7
  const staleIssues = await findStaleIssues()
  let warned = 0

  for (const issue of staleIssues) {
    if (!issue.assignee_id) continue

    await incrementWarningCount(issue.issue_id)

    await createNotificationService(
      issue.assignee_id,
      null, // system notification
      NotificationType.stale_issue_warning,
      "Stale issue warning",
      `${issue.issue_key} "${issue.issue_name}" has had no activity for ${staleDays}+ days`,
      issue.issue_id,
      issue.project_id
    )

    warned++
  }

  return { checked: staleIssues.length, warned }
}