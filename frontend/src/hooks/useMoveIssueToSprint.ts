import { useMutation, useQueryClient } from '@tanstack/react-query'
import { issueApi, issueListKey } from '../api/issue.api'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../utils/apiError'
import { t } from '../i18n/useT'

export function useMoveIssueToSprint(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      issueId,
      sprintId,
    }: {
      issueId: number
      sprintId: number | null
      fromSprintId?: number | null
    }) => issueApi.updateSprint(issueId, sprintId),
    onSuccess: (_data, { sprintId }) => {
      toast.success(sprintId == null ? t('backlog.movedToBacklog') : t('backlog.movedToSprint'))
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('backlog.moveFailed'))),
    onSettled: (_data, _err, vars) => {
      // Refetch đúng túi: mọi page backlog + sprint nguồn + sprint đích
      queryClient.invalidateQueries({ queryKey: ['issues', projectId, 'backlog'] })
      queryClient.invalidateQueries({ queryKey: issueListKey.all(projectId) })
      if (vars.fromSprintId != null) {
        queryClient.invalidateQueries({
          queryKey: issueListKey.sprint(projectId, vars.fromSprintId),
        })
      }
      if (vars.sprintId != null) {
        queryClient.invalidateQueries({
          queryKey: issueListKey.sprint(projectId, vars.sprintId),
        })
      }
    },
  })
}
