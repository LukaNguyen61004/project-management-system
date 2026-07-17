import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, X, Pencil, Trash2 } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import type { Issue } from '../../types/issue.types'
import type { IssuePriority, IssueStatus, IssueType } from '../../types/enums'
import { issueApi } from '../../api/issue.api'
import { projectApi } from '../../api/project.api'
import { commentApi } from '../../api/comment.api'
import { epicApi } from '../../api/epic.api'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_TYPES } from '../../utils/constants'
import { cn } from '../../utils/cn'
import { getWarningLabel, isIssueWarned } from '../../utils/issueWarning'
import { useAuthStore } from '../../store/auth.store'
import { IssueAttachments } from './IssueAttachments'
import { dateInputToISO, isoToDateInput } from '../../utils/date'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'sonner'


interface IssueDetailPanelProps {
  issue: Issue | null
  projectId: number
  onClose: () => void
  onDeleted?: () => void
}

const selectClass =
  'mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue'

export function IssueDetailPanel({ issue, projectId, onClose, onDeleted }: IssueDetailPanelProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<IssueType>('task')
  const [dueDate, setDueDate] = useState('')
  const [estimate, setEstimate] = useState('')
 
  const [saveError, setSaveError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const issueId = issue?.issue_id
  const isOwnComment = (userId: number) => currentUser?.user_id === userId

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

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => commentApi.getByIssue(issueId!).then((r) => r.data.data),
    enabled: !!issueId,
  })

  const { data: epics = [] } = useQuery({
    queryKey: ['epics', projectId],
    queryFn: () => epicApi.getByProject(projectId).then((r) => r.data.data),
    enabled: !!issueId && !!projectId,
  })

  const currentIssue = detail || issue

  useEffect(() => {
    if (currentIssue) {
      setTitle(currentIssue.issue_name)
      setDescription(currentIssue.issue_description || '')
      setType(currentIssue.issue_type)
      setDueDate(isoToDateInput(currentIssue.due_date))
      setEstimate(currentIssue.estimate != null ? String(currentIssue.estimate) : '')
      
      setSaveError('')
    }
  }, [
    currentIssue?.issue_id,
    currentIssue?.issue_name,
    currentIssue?.issue_description,
    currentIssue?.issue_type,
    currentIssue?.due_date,
    currentIssue?.estimate,
  ])

  

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
    onSuccess: () => {
      toast.success('Đã cập nhật status')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Cập nhật status thất bại')),
  })

  const priorityMutation = useMutation({
    mutationFn: (priority: IssuePriority) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.changePriority(issueId, priority)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật priority')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Cập nhật priority thất bại')),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error('No issue')
      return issueApi.update(issueId, {
        issue_name: title,
        issue_description: description || undefined,
        issue_type: type,
        due_date: dueDate ? dateInputToISO(dueDate)! : null,
        estimate: estimate === '' ? null : Number(estimate),
      })
    },
    onSuccess: () => {
      setSaveError('')
      toast.success('Đã lưu issue')
      invalidate()
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Lưu issue thất bại')
      setSaveError(msg)
      toast.error(msg)
    },
  })

  const handleSave = () => {
    setSaveError('')
    if (title.length < 3) return
    
    if (estimate !== '' && (Number.isNaN(Number(estimate)) || Number(estimate) < 0)) {
      setSaveError('Story points phải là số >= 0')
      return
    }
    updateMutation.mutate()
  }

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error('No issue')
      return issueApi.delete(issueId)
    },
    onSuccess: () => {
      toast.success('Đã xóa issue')
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      onDeleted?.()
      onClose()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Xóa issue thất bại')),
  })

  const assignMutation = useMutation({
    mutationFn: (assignee_id: number | null) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.assign(issueId, assignee_id)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật assignee')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Cập nhật assignee thất bại')),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => {
      if (!issueId) throw new Error('No issue')
      return commentApi.create(issueId, content)
    },
    onSuccess: () => {
      setCommentText('')
      toast.success('Đã thêm comment')
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Thêm comment thất bại')),
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) => {
      if (!issueId) throw new Error('No issue')
      return commentApi.update(issueId, commentId, content)
    },
    onSuccess: () => {
      setEditingCommentId(null)
      setEditText('')
      toast.success('Đã cập nhật comment')
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Cập nhật comment thất bại')),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => {
      if (!issueId) throw new Error('No issue')
      return commentApi.delete(issueId, commentId)
    },
    onSuccess: () => {
      toast.success('Đã xóa comment')
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Xóa comment thất bại')),
  })

  const epicMutation = useMutation({
    mutationFn: (epic_id: number | null) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.updateEpic(issueId, epic_id)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật epic')
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Cập nhật epic thất bại')),
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
          {isIssueWarned(currentIssue) && (
            <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{getWarningLabel(currentIssue)}</span>
            </div>
          )}

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
              <label className="text-sm font-medium text-jira-text">Epic</label>
              <select
                value={String(currentIssue.epic_id ?? '')}
                onChange={(e) => {
                  const v = e.target.value
                  epicMutation.mutate(v === '' ? null : Number(v))
                }}
                className={selectClass}
              >
                <option value="">No epic</option>
                {epics.map((e) => (
                  <option key={e.epic_id} value={e.epic_id}>
                    {e.epic_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Assignee</label>
              <select
                value={String(currentIssue.assignee_id ?? '')}
                onChange={(e) => {
                  const value = e.target.value
                  assignMutation.mutate(value === '' ? null : Number(value))
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
              <div className="flex items-center gap-2 mt-1">
                {currentIssue.reporter ? (
                  <>
                    <Avatar
                      name={currentIssue.reporter.user_name || currentIssue.reporter.user_email}
                      src={currentIssue.reporter.user_avatar_url}
                      size="sm"
                    />
                    <span className="text-sm text-jira-text">
                      {currentIssue.reporter.user_name ||
                        currentIssue.reporter.user_email ||
                        `#${currentIssue.reporter_id}`}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-jira-text">#{currentIssue.reporter_id}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={selectClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">Story points</label>
              <input
                type="number"
                min={0}
                max={100}
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                className={selectClass}
                placeholder="e.g. 3"
              />
            </div>
          </div>

        
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || title.length < 3}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>

          {issueId && (
            <IssueAttachments issueId={issueId} projectId={projectId} />
          )}

          <div className="pt-4 border-t border-jira-border">
            <h3 className="text-sm font-semibold text-jira-text-subtle mb-3">
              Comments ({comments.length})
            </h3>

            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c.comment_id} className="flex gap-3">
                  <Avatar
                    name={c.user?.user_name || c.user?.user_email}
                    src={c.user?.user_avatar_url}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {c.user?.user_name || c.user?.user_email}
                      </span>
                      <span className="text-xs text-jira-text-subtle">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                      {isOwnComment(c.user_id) && editingCommentId !== c.comment_id && (
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => {
                              setEditingCommentId(c.comment_id)
                              setEditText(c.content)
                            }}
                            className="p-1 rounded text-jira-text-subtle hover:text-jira-blue hover:bg-gray-100"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => {
                              if (window.confirm('Delete this comment?')) {
                                deleteCommentMutation.mutate(c.comment_id)
                              }
                            }}
                            className="p-1 rounded text-jira-text-subtle hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === c.comment_id ? (
                      <div className="mt-1 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className={selectClass}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={!editText.trim() || updateCommentMutation.isPending}
                            onClick={() =>
                              updateCommentMutation.mutate({
                                commentId: c.comment_id,
                                content: editText.trim(),
                              })
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditText('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-jira-text mt-1">{c.content}</p>
                    )}

                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className={cn(
                  'flex-1 rounded border border-jira-border px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-jira-blue'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    commentMutation.mutate(commentText.trim())
                  }
                }}
              />
              <Button
                size="sm"
                disabled={!commentText.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate(commentText.trim())}
              >
                <Send size={14} />
              </Button>
            </div>
          </div>

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
