import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { Issue } from '../../types/issue.types'
import type { Sprint } from '../../types/sprint.types'
import type { IssueFilters } from '../../types/issueFilter.types'
import { useMoveIssueToSprint } from '../../hooks/useMoveIssueToSprint'
import { SprintList } from '../sprint/SprintList'
import { resolveTargetSprintId } from '../sprint/sprintDnd'
import { BacklogSection } from './BacklogSection'
import { BacklogIssueRow } from './BacklogIssueRow'

interface BacklogListProps {
  projectId: number
  issues: Issue[]
  sprints: Sprint[]
  onIssueClick: (issue: Issue) => void
  onEditSprint?: (sprint: Sprint) => void
  filters?: IssueFilters
  page: number
  totalPage: number
  total: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

function issueFromDrag(event: { active: { data: { current?: unknown } } }): Issue | undefined {
  const data = event.active.data.current as { issue?: Issue } | undefined
  return data?.issue
}

const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  if (hits.length > 0) return hits
  return rectIntersection(args)
}

export function BacklogList({
  projectId,
  issues,
  sprints,
  onIssueClick,
  onEditSprint,
  filters,
  page,
  totalPage,
  total,
  onPageChange,
  isLoading,
}: BacklogListProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)
  const moveMutation = useMoveIssueToSprint(projectId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issueFromDrag(event)
    if (issue) setActiveIssue(issue)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null)
    const { over } = event
    if (!over) return

    const issue = issueFromDrag(event)
    if (!issue) return

    const targetSprintId = resolveTargetSprintId(over.id, over.data.current)
    if (targetSprintId === undefined) return
    if (issue.sprint_id === targetSprintId) return

    if (targetSprintId != null) {
      const target = sprints.find((s) => s.sprint_id === targetSprintId)
      if (target?.sprint_status === 'completed') return
    }

    if (issue.sprint_id != null) {
      const current = sprints.find((s) => s.sprint_id === issue.sprint_id)
      if (current?.sprint_status === 'completed' && issue.issue_status === 'done') return
    }

    moveMutation.mutate({
      issueId: issue.issue_id,
      sprintId: targetSprintId,
      fromSprintId: issue.sprint_id,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4">
        <SprintList
          projectId={projectId}
          sprints={sprints}
          onIssueClick={onIssueClick}
          onEditSprint={onEditSprint}
          filters={filters}
        />
        <BacklogSection
          issues={issues}
          onIssueClick={onIssueClick}
          page={page}
          totalPage={totalPage}
          total={total}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="flex items-center gap-3 px-4 py-2.5 cinder-glass shadow-lg rounded-[16px] cursor-grabbing">
            <BacklogIssueRow issue={activeIssue} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
