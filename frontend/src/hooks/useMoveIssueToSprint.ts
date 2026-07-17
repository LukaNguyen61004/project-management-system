import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Issue } from '../types/issue.types'
import { issueApi } from '../api/issue.api'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../utils/apiError'

export function useMoveIssueToSprint(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, sprintId }: { issueId: number; sprintId: number | null }) =>
      issueApi.updateSprint(issueId, sprintId),
    onMutate: async ({ issueId, sprintId }) => {
      await queryClient.cancelQueries({ queryKey: ['issues', projectId] })
      const previous = queryClient.getQueryData<Issue[]>(['issues', projectId])
      queryClient.setQueryData<Issue[]>(['issues', projectId], (old = []) =>
        old.map((issue) =>
          issue.issue_id === issueId ? { ...issue, sprint_id: sprintId } : issue
        )
      )
      return { previous }
    },
    onSuccess: (_data, { sprintId }) => {
      toast.success(sprintId == null ? 'Đã đưa issue về backlog' : 'Đã chuyển issue vào sprint')
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issues', projectId], context.previous)
      }
      toast.error(getApiErrorMessage(err, 'Chuyển sprint thất bại'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
    },
  })
}
