import { useState, type SelectHTMLAttributes } from 'react'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import type { IssueFilters } from '../../types/issueFilter.types'
import { EMPTY_ISSUE_FILTERS } from '../../types/issueFilter.types'
import type { ProjectMember } from '../../types/project.types'
import type { Epic } from '../../types/epic.types'
import type { IssuePriority, IssueStatus, IssueType } from '../../types/enums'
import { ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_TYPES } from '../../utils/constants'
import { Button } from '../ui/Button'
import { useT } from '../../i18n/useT'
import { cn } from '../../utils/cn'

interface IssueFilterBarProps {
  filters: IssueFilters
  onChange: (filters: IssueFilters) => void
  members: ProjectMember[]
  epics: Epic[]
  totalCount: number
  filteredCount: number
}

const selectClass =
  'appearance-none rounded-3xl border border-jira-border pl-3 pr-8 py-1.5 text-sm bg-transparent text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/25 w-full md:w-max max-w-full'

function FilterSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full md:w-max max-w-full">
      <select {...props} className={className}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70"
      />
    </div>
  )
}

export function IssueFilterBar({
  filters,
  onChange,
  members,
  epics,
  totalCount,
  filteredCount,
}: IssueFilterBarProps) {
  const t = useT()
  const [filtersOpen, setFiltersOpen] = useState(false)
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
    <div className="px-4 py-3 border-b border-white/15 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px] max-w-none sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-text-subtle"
          />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder={t('filter.search')}
            className="w-full rounded-2xl border border-jira-border bg-transparent pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/25"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="md:hidden shrink-0"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal size={14} />
          {t('filter.filters')}
        </Button>

        <div
          className={cn(
            'flex flex-wrap items-center gap-2 w-full md:w-auto md:contents',
            !filtersOpen && 'max-md:hidden'
          )}
        >
          <FilterSelect
          value={filters.status}
          onChange={(e) => set('status', e.target.value as IssueStatus | '')}
          className={selectClass}
        >
          <option value="">{t('filter.allStatuses')}</option>
          {ISSUE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {t(`status.${s.value}`)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={filters.priority}
          onChange={(e) => set('priority', e.target.value as IssuePriority | '')}
          className={selectClass}
        >
          <option value="">{t('filter.allPriorities')}</option>
          {ISSUE_PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {t(`priority.${p.value}`)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={filters.type}
          onChange={(e) => set('type', e.target.value as IssueType | '')}
          className={selectClass}
        >
          <option value="">{t('filter.allTypes')}</option>
          {ISSUE_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {t(`type.${item.value}`)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={String(filters.assigneeId)}
          onChange={(e) => {
            const v = e.target.value
            set('assigneeId', v === '' ? '' : Number(v))
          }}
          className={selectClass}
        >
          <option value="">{t('filter.allAssignees')}</option>
          <option value="0">{t('common.unassigned')}</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.user.user_name || m.user.user_email}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={String(filters.epicId)}
          onChange={(e) => {
            const v = e.target.value
            set('epicId', v === '' ? '' : Number(v))
          }}
          className={selectClass}
        >
          <option value="">{t('filter.allEpics')}</option>
          <option value="0">{t('common.noEpic')}</option>
          {epics.map((e) => (
            <option key={e.epic_id} value={e.epic_id}>
              {e.epic_name}
            </option>
          ))}
        </FilterSelect>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(EMPTY_ISSUE_FILTERS)}
          >
            <X size={14} />
            {t('common.clear')}
          </Button>
        )}
        </div>
      </div>

      <p className="text-xs text-jira-text-subtle">
        {t('common.showingOf', { filtered: filteredCount, total: totalCount })}
      </p>
    </div>
  )
}
