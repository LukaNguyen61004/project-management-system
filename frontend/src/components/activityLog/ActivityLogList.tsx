import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../../api/activityLog.api'
import { Button } from '../ui/Button'
import { ActivityLogItem } from './ActivityLogItem'

interface ActivityLogListProps {
  projectId: number
}

export function ActivityLogList({ projectId }: ActivityLogListProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activities', projectId, page],
    queryFn: () => activityApi.getByProject(projectId, page).then((r) => r.data.result),
    enabled: !!projectId,
  })

  const activities = data?.activities ?? []
  const pagination = data?.pagination

  if (isLoading) {
    return <p className="text-sm text-jira-text-subtle py-4">Loading activity...</p>
  }

  if (isError) {
    return <p className="text-sm text-red-500 py-4">Failed to load activity.</p>
  }

  return (
    <div>
      <div className="divide-y divide-jira-border">
        {activities.length === 0 ? (
          <p className="text-sm text-jira-text-subtle py-6 text-center">No activity yet</p>
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
            Previous
          </Button>
          <span className="text-xs text-jira-text-subtle self-center">
            {page} / {pagination.totalPage}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= pagination.totalPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}