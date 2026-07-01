
import { checkStaleIssuesService } from "../services/staleIssue.service.js"
import cron, { type ScheduledTask } from "node-cron"

let task: ScheduledTask | null = null

export function startStaleIssueJob() {
  if (task) return

  // Mỗi ngày 9:00 sáng (giờ server)
  // Dev: dùng "*/5 * * * *" = mỗi 5 phút
  const schedule = process.env.STALE_CRON_SCHEDULE || "0 9 * * *"

  const runCheck = async (label: string) => {
    try {
      const result = await checkStaleIssuesService()
      console.log(`[stale-job] ${label}`, result)
    } catch (err) {
      console.error(`[stale-job] ${label} failed`, err)
    }
  }

  task = cron.schedule(schedule, () => runCheck("scheduled"))

  console.log(`[stale-job] cron scheduled: ${schedule}`)
  void runCheck("initial")
}