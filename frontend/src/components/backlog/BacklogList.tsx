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
import type { Issue } from '../../types/issue.types'
import type { Sprint } from '../../types/sprint.types'
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
}

export function BacklogList({
  projectId,
  issues,
  sprints,
  onIssueClick,
  onEditSprint,
}: BacklogListProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)
  const moveMutation = useMoveIssueToSprint(projectId)
  const backlogIssues = issues.filter((i) => !i.sprint_id)

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

    const targetSprintId = resolveTargetSprintId(over.id, issues)
    if (targetSprintId === undefined) return
    if (issue.sprint_id === targetSprintId) return

    moveMutation.mutate({ issueId, sprintId: targetSprintId })
  }

  if (issues.length === 0) {
    return (
      <p className="text-sm text-jira-text-subtle text-center py-16">
        No issues match your filters
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
      <div className="p-4">
        <SprintList
          sprints={sprints}
          issues={issues}
          onIssueClick={onIssueClick}
          onEditSprint={onEditSprint}
        />
        <BacklogSection issues={backlogIssues} onIssueClick={onIssueClick} />
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white shadow-lg rounded border border-jira-border cursor-grabbing">
            <BacklogIssueRow issue={activeIssue} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
