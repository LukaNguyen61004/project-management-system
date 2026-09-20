import type { Issue } from '../../types/issue.types'
import { SprintDropZone } from '../sprint/SprintDropZone'
import { BACKLOG_DROP_ID } from '../sprint/sprintDnd'
import { DraggableBacklogIssueRow } from './DraggableBacklogIssueRow'
import { Button } from '../ui/Button'
import { useT } from '../../i18n/useT'

interface BacklogSectionProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  page: number
  totalPage: number
  total: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function BacklogSection({
  issues,
  onIssueClick,
  page,
  totalPage,
  total,
  onPageChange,
  isLoading,
}: BacklogSectionProps) {
  const t = useT()
  return (
    <div className="cinder-glass rounded-[20px]">
      <div className="px-4 py-3 border-b border-jira-border">
        <h3 className="text-sm font-semibold text-jira-text">
          {t('backlog.sectionTitle', { count: total })}
        </h3>
      </div>
      <SprintDropZone
        id={BACKLOG_DROP_ID}
        isEmpty={!isLoading && issues.length === 0}
        emptyMessage={t('common.dropHere')}
      >
        {isLoading ? (
          <p className="text-sm text-jira-text-subtle text-center py-6">{t('backlog.loadingIssues')}</p>
        ) : (
          <div className="divide-y divide-jira-border">
            {issues.map((issue) => (
              <DraggableBacklogIssueRow
                key={issue.issue_id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
              />
            ))}
          </div>
        )}
      </SprintDropZone>

      {totalPage > 1 && (
        <div className="flex justify-center gap-2 px-4 py-3 border-t border-jira-border">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className="text-xs text-jira-text-subtle self-center">
            {t('common.pageOf', { page, total: totalPage })}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPage}
            onClick={() => onPageChange(page + 1)}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  )
}
