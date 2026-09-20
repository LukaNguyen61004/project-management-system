import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../../api/activityLog.api'
import { Button } from '../ui/Button'
import { ActivityLogItem } from './ActivityLogItem'
import { useT } from '../../i18n/useT'

interface ActivityLogListProps {
  projectId: number
}

export function ActivityLogList({ projectId }: ActivityLogListProps) {
  const [page, setPage] = useState(1)
  const t = useT()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activities', projectId, page],
    queryFn: () => activityApi.getByProject(projectId, page).then((r) => r.data.result),
    enabled: !!projectId,
  })

  const activities = data?.activities ?? []
  const pagination = data?.pagination

  if (isLoading) {
    return <p className="text-sm text-jira-text-subtle py-4">{t('activity.loading')}</p>
  }

  if (isError) {
    return <p className="text-sm text-red-500 py-4">{t('activity.loadFailed')}</p>
  }

  return (
    <div>
      <div className="divide-y divide-jira-border">
        {activities.length === 0 ? (
          <p className="text-sm text-jira-text-subtle py-6 text-center">{t('activity.empty')}</p>
        ) : (
          activities.map((a) => <ActivityLogItem key={a.log_id} activity={a} />)
        )}
      </div>

      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className="text-xs text-jira-text-subtle self-center">
            {t('common.pageOf', { page, total: pagination.totalPage })}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= pagination.totalPage}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  )
}