import { useMemo } from "react";
import type { Issue } from '../types/issue.types'
import type { IssueFilters } from "../types/issueFilter.types";

export function useIssueFilters(issues: Issue[], filters: IssueFilters) {
    return useMemo(() => {
        return issues.filter((issue) => {
            if (filters.q.trim()) {
                const q = filters.q.trim().toLowerCase()
                const match =
                    issue.issue_key.toLowerCase().includes(q) ||
                    issue.issue_name.toLowerCase().includes(q)
                if (!match) return false
            }
            if (filters.status && issue.issue_status !== filters.status) return false
            if (filters.priority && issue.issue_priority !== filters.priority) return false
            if (filters.type && issue.issue_type !== filters.type) return false
            
            // assigneeId === 0 → unassigned
            if (filters.assigneeId === 0 && issue.assignee_id !== null) return false
            if (filters.assigneeId !== '' && filters.assigneeId !== 0 && issue.assignee_id !== filters.assigneeId) return false

            // epicId === 0 → no epic
            if (filters.epicId === 0 && issue.epic_id !== null) return false
            if (filters.epicId !== '' && filters.epicId !== 0 && issue.epic_id !== filters.epicId) return false
            return true
        })
    }, [issues, filters])
}