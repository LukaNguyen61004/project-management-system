import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Issue } from '../../types/issue.types'
import type { IssueStatus } from '../../types/enums'
import { issueApi } from '../../api/issue.api'
import { ISSUE_STATUSES } from '../../utils/constants'
import { KanbanColumn } from './KanbanColumn'
import { IssueCard } from './IssueCard'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../utils/apiError'
import { getStatusTransitionError } from '../../utils/issueStatus'
import type { IssueListPage } from '../../api/issue.api'
import { useAppDndSensors } from '../../hooks/useAppDndSensors'
import { useT, t } from '../../i18n/useT'

interface KanbanBoardProps {
  projectId: number
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  listQueryKey: readonly unknown[]
}

export function KanbanBoard({ projectId, issues, onIssueClick, listQueryKey }: KanbanBoardProps) {
  const queryClient = useQueryClient()
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)
  const translate = useT()

  const issuesByStatus = ISSUE_STATUSES.reduce(
    (acc, { value }) => {
      acc[value] = issues.filter((i) => i.issue_status === value)
      return acc
    },
    {} as Record<IssueStatus, Issue[]>
  )

  const statusMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: number; status: IssueStatus }) =>
      issueApi.changeStatus(issueId, status),

    // 1. TRƯỚC khi gọi API — sửa UI ngay
    onMutate: async ({ issueId, status }) => {
      // Dừng fetch đang chạy, tránh ghi đè optimistic
      await queryClient.cancelQueries({ queryKey: listQueryKey })

      // Lưu bản cũ để rollback nếu lỗi
      const previous = queryClient.getQueryData<IssueListPage[]>(listQueryKey)

      // Cập nhật cache — card nhảy cột NGAY
      queryClient.setQueryData<IssueListPage>(listQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          issues: old.issues.map((issue) =>
            issue.issue_id === issueId ? { ...issue, issue_status: status } : issue
          ),
        }
      })
      return { previous }
    },

    // 2. API lỗi → trả lại data cũ
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issues', projectId], context.previous)
      }
      toast.error(getApiErrorMessage(err, t('board.statusFailed')))
    },

    onSuccess: () => {
      toast.success(t('board.statusUpdated'))
    },

    // 3. Xong (thành công hay lỗi) → sync lại server (nền, không block UI)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })

  const sensors = useAppDndSensors()

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.issue_id === event.active.id)
    if (issue) setActiveIssue(issue)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null)
    const { active, over } = event
    if (!over) return

    const issueId = active.id as number
    const issue = issues.find((i) => i.issue_id === issueId)
    if (!issue) return

    let newStatus: IssueStatus | null = null

    // Thả lên cột (vùng droppable)
    if (ISSUE_STATUSES.some((s) => s.value === over.id)) {
      newStatus = over.id as IssueStatus
    } else {
      // Thả lên card khác → lấy status cột của card đó
      const overIssue = issues.find((i) => i.issue_id === over.id)
      if (overIssue) newStatus = overIssue.issue_status
    }

    if (newStatus && newStatus !== issue.issue_status) {
      const error = getStatusTransitionError(issue.issue_status, newStatus, issue.assignee_id)
      if (error) {
        toast.error(error)
        return
      }
      statusMutation.mutate({ issueId, status: newStatus })
    }
  }

  if (issues.length === 0) {
    return (
      <p className="text-sm text-jira-text-subtle text-center py-16">
        {translate('board.emptyFilters')}
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 md:gap-4 p-3 md:p-4 overflow-x-auto snap-x snap-mandatory min-h-[calc(100dvh-14rem)] [scrollbar-width:thin]">
        {ISSUE_STATUSES.map(({ value }) => (
          <KanbanColumn
            key={value}
            status={value}
            label={translate(`status.${value}`)}
            issues={issuesByStatus[value]}
            onIssueClick={onIssueClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue && <IssueCard issue={activeIssue} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}