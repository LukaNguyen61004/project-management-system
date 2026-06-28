import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
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

interface KanbanBoardProps {
  projectId: number
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function KanbanBoard({ projectId, issues, onIssueClick }: KanbanBoardProps) {
  const queryClient = useQueryClient()
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)

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
      await queryClient.cancelQueries({ queryKey: ['issues', projectId] })

      // Lưu bản cũ để rollback nếu lỗi
      const previous = queryClient.getQueryData<Issue[]>(['issues', projectId])

      // Cập nhật cache — card nhảy cột NGAY
      queryClient.setQueryData<Issue[]>(['issues', projectId], (old = []) =>
        old.map((issue) =>
          issue.issue_id === issueId
            ? { ...issue, issue_status: status }
            : issue
        )
      )

      return { previous }
    },

    // 2. API lỗi → trả lại data cũ
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issues', projectId], context.previous)
      }
    },

    // 3. Xong (thành công hay lỗi) → sync lại server (nền, không block UI)
    /*onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
    },*/
  })

  // Chỉ bắt drag sau khi kéo 8px — tránh nhầm với click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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
      statusMutation.mutate({ issueId, status: newStatus })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-[calc(100vh-8rem)]">
        {ISSUE_STATUSES.map(({ value, label }) => (
          <KanbanColumn
            key={value}
            status={value}
            label={label}
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