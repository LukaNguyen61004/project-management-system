import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import type { Issue } from '../../types/issue.type'
import type { IssuePriority, IssueStatus, IssueType } from '../../types/enums'
import { issueApi } from '../../api/issue.api'
import { projectApi } from '../../api/project.api'
import { ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_TYPES } from '../../utils/constants'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface IssueDetailPanelProps {
  issue: Issue | null
  projectId: number
  onClose: () => void
  onDeleted?: () => void
}

const selectClass =
  'mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue'

export function IssueDetailPanel({
  issue,
  projectId,
  onClose,
  onDeleted,
}: IssueDetailPanelProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<IssueType>('task')

  const issueId = issue?.issue_id

  const { data: detail } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issueApi.getById(issueId!).then((r) => r.data.result),
    enabled: !!issueId,
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectApi.getMembers(projectId).then((r) => r.data.members),
    enabled: !!issueId && !!projectId,
  })

  const currentIssue = detail || issue

  useEffect(() => {
    if (currentIssue) {
      setTitle(currentIssue.issue_name)
      setDescription(currentIssue.issue_description || '')
      setType(currentIssue.issue_type)
    }
  }, [currentIssue?.issue_id, currentIssue?.issue_name, currentIssue?.issue_description, currentIssue?.issue_type])

  const invalidate = () => {
    if (!issueId) return
    queryClient.invalidateQueries({ queryKey: ['issues'] })
    queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
  }

  const statusMutation = useMutation({
    mutationFn: (status: IssueStatus) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.changeStatus(issueId, status)
    },
    onSuccess: invalidate,
  })

  const priorityMutation = useMutation({
    mutationFn: (priority: IssuePriority) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.changePriority(issueId, priority)
    },
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error('No issue')
      return issueApi.update(issueId, {
        issue_name: title,
        issue_description: description || undefined,
        issue_type: type,
      })
    },
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error('No issue')
      return issueApi.delete(issueId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      onDeleted?.()
      onClose()
    },
  })

  const assignMutation = useMutation({
    mutationFn: (assignee_id: number) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.assign(issueId, assignee_id)
    },
    onSuccess: invalidate,
  })

  if (!issue || !currentIssue) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto min-h-full">
        <div className="sticky top-0 bg-white border-b border-jira-border px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-jira-text-subtle font-medium">
            {currentIssue.issue_key}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-jira-text-subtle"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Input
            label="Summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            required
          />

          <div>
            <label className="text-sm font-medium text-jira-text">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={selectClass}
              placeholder="Optional..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-jira-text">Status</label>
              <select
                value={currentIssue.issue_status}
                onChange={(e) => statusMutation.mutate(e.target.value as IssueStatus)}
                className={selectClass}
              >
                {ISSUE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Priority</label>
              <select
                value={currentIssue.issue_priority}
                onChange={(e) => priorityMutation.mutate(e.target.value as IssuePriority)}
                className={selectClass}
              >
                {ISSUE_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IssueType)}
                className={selectClass}
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Assignee</label>
              <select
                value={currentIssue.assignee_id ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  if (id) assignMutation.mutate(id)
                }}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user.user_name || m.user.user_email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Reporter</label>
              <p className="mt-1 text-sm text-jira-text">
                {currentIssue.reporter?.user_name ||
                  currentIssue.reporter?.user_email ||
                  `#${currentIssue.reporter_id}`}
              </p>
            </div>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || title.length < 3}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>

          <div className="pt-4 border-t border-jira-border">
            <Button
              type="button"
              variant="secondary"
              className="text-red-500 border-red-200 hover:bg-red-50"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm('Delete this issue?')) {
                  deleteMutation.mutate()
                }
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete issue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
