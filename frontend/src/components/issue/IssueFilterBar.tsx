import { Search, X } from 'lucide-react'
import type { IssueFilters } from '../../types/issueFilter.types'
import { EMPTY_ISSUE_FILTERS } from '../../types/issueFilter.types'
import type { ProjectMember } from '../../types/project.types'
import type { Epic } from '../../types/epic.types'
import type { IssuePriority, IssueStatus, IssueType } from '../../types/enums'
import { ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_TYPES } from '../../utils/constants'
import { Button } from '../ui/Button'

interface IssueFilterBarProps {
  filters: IssueFilters
  onChange: (filters: IssueFilters) => void
  members: ProjectMember[]
  epics: Epic[]
  totalCount: number
  filteredCount: number
}

const selectClass =
  'rounded border border-jira-border px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-jira-blue min-w-[120px]'

export function IssueFilterBar({
  filters,
  onChange,
  members,
  epics,
  totalCount,
  filteredCount,
}: IssueFilterBarProps) {
  const set = <K extends keyof IssueFilters>(key: K, value: IssueFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.q.trim() !== '' ||
    filters.status !== '' ||
    filters.priority !== '' ||
    filters.type !== '' ||
    filters.assigneeId !== '' ||
    filters.epicId !== ''

  return (
    <div className="px-4 py-3 bg-white border-b border-jira-border space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-text-subtle"
          />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Search key or title..."
            className="w-full rounded border border-jira-border pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => set('status', e.target.value as IssueStatus | '')}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {ISSUE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => set('priority', e.target.value as IssuePriority | '')}
          className={selectClass}
        >
          <option value="">All priorities</option>
          {ISSUE_PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => set('type', e.target.value as IssueType | '')}
          className={selectClass}
        >
          <option value="">All types</option>
          {ISSUE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Assignee */}
        <select
          value={String(filters.assigneeId)}
          onChange={(e) => {
            const v = e.target.value
            set('assigneeId', v === '' ? '' : Number(v))
          }}
          className={selectClass}
        >
          <option value="">All assignees</option>
          <option value="0">Unassigned</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.user.user_name || m.user.user_email}
            </option>
          ))}
        </select>

        {/* Epic */}
        <select
          value={String(filters.epicId)}
          onChange={(e) => {
            const v = e.target.value
            set('epicId', v === '' ? '' : Number(v))
          }}
          className={selectClass}
        >
          <option value="">All epics</option>
          <option value="0">No epic</option>
          {epics.map((e) => (
            <option key={e.epic_id} value={e.epic_id}>
              {e.epic_name}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(EMPTY_ISSUE_FILTERS)}
          >
            <X size={14} />
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-jira-text-subtle">
        Showing {filteredCount} of {totalCount} issues
      </p>
    </div>
  )
}