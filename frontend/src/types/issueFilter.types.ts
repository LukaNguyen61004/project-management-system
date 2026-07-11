import type { IssuePriority, IssueStatus, IssueType } from "./enums";

export interface IssueFilters {
    q: string,
    status: IssueStatus | ''
    priority: IssuePriority | ''
    type: IssueType | ''
    assigneeId: number | ''
    epicId: number | ''
}

export const EMPTY_ISSUE_FILTERS: IssueFilters = {
    q: '',
    status: '',
    priority: '',
    type: '',
    assigneeId: '',
    epicId: '',
}

