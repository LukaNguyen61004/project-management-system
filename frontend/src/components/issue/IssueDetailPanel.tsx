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
import { ISSUE_PRIORITIES, ISSUE_TYPES } from '../../utils/constants'
import { cn } from '../../utils/cn'
import { getWarningLabel, isIssueWarned } from '../../utils/issueWarning'
import { useAuthStore } from '../../store/auth.store'
import { IssueAttachments } from './IssueAttachments'
import { dateInputToISO, isoToDateInput } from '../../utils/date'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'sonner'
import { PRIORITY_RANK } from '../../utils/issuePriority'
import { getAllowedStatuses } from '../../utils/issueStatus'
import { useT } from '../../i18n/useT'
import { useDateFnsLocale } from '../../i18n/dateLocale'


interface IssueDetailPanelProps {
  issue: Issue | null
  projectId: number
  onClose: () => void
  onDeleted?: () => void
  onAddSubtask?: (parent: Issue) => void
}

const selectClass =
  'mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue'

export function IssueDetailPanel({ issue, projectId, onClose, onDeleted, onAddSubtask }: IssueDetailPanelProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const t = useT()
  const dateLocale = useDateFnsLocale()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<IssueType>('task')
  const [dueDate, setDueDate] = useState('')

  const [saveError, setSaveError] = useState('')
  const [titleError, setTitleError] = useState('')
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

  const cachedIssues = queryClient.getQueryData<Issue[] | { issues?: Issue[] }>(['issues', projectId])
  const issues = Array.isArray(cachedIssues)
    ? cachedIssues
    : cachedIssues?.issues ?? []
  const canCreateBug = issues.some((i) => i.issue_status === 'done')

  useEffect(() => {
    if (currentIssue) {
      setTitle(currentIssue.issue_name)
      setDescription(currentIssue.issue_description || '')
      setType(currentIssue.issue_type)
      setDueDate(isoToDateInput(currentIssue.due_date))

      setSaveError('')
    }
  }, [
    currentIssue?.issue_id,
    currentIssue?.issue_name,
    currentIssue?.issue_description,
    currentIssue?.issue_type,
    currentIssue?.due_date,
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
      toast.success(t('issue.statusUpdated'))
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.statusFailed'))),
  })

  const priorityMutation = useMutation({
    mutationFn: (priority: IssuePriority) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.changePriority(issueId, priority)
    },
    onSuccess: () => {
      toast.success(t('issue.priorityUpdated'))
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.priorityFailed'))),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error('No issue')
      return issueApi.update(issueId, {
        issue_name: title.trim(),
        issue_description: description || undefined,
        issue_type: type,
        due_date: dueDate ? dateInputToISO(dueDate)! : null,
      })
    },
    onSuccess: () => {
      setSaveError('')
      toast.success(t('issue.saved'))
      invalidate()
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, t('issue.saveFailed'))
      setSaveError(msg)
      toast.error(msg)
    },
  })

  const handleSave = () => {
    setSaveError('')
    const trimmed = title.trim()
    if (trimmed.length < 3) {
      setTitleError(t('issue.summaryMin'))
      return
    }
    if (trimmed.length > 255) {
      setTitleError(t('issue.summaryMax'))
      return
    }
    setTitleError('')
    updateMutation.mutate()
  }

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error('No issue')
      return issueApi.delete(issueId)
    },
    onSuccess: () => {
      toast.success(t('issue.deleted'))
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      onDeleted?.()
      onClose()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.deleteFailed'))),
  })

  const assignMutation = useMutation({
    mutationFn: (assignee_id: number | null) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.assign(issueId, assignee_id)
    },
    onSuccess: () => {
      toast.success(t('issue.assigneeUpdated'))
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.assigneeFailed'))),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => {
      if (!issueId) throw new Error('No issue')
      return commentApi.create(issueId, content)
    },
    onSuccess: () => {
      setCommentText('')
      toast.success(t('issue.commentAdded'))
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.commentFailed'))),
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) => {
      if (!issueId) throw new Error('No issue')
      return commentApi.update(issueId, commentId, content)
    },
    onSuccess: () => {
      setEditingCommentId(null)
      setEditText('')
      toast.success(t('issue.commentUpdated'))
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.commentUpdateFailed'))),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => {
      if (!issueId) throw new Error('No issue')
      return commentApi.delete(issueId, commentId)
    },
    onSuccess: () => {
      toast.success(t('issue.commentDeleted'))
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.commentDeleteFailed'))),
  })

  const epicMutation = useMutation({
    mutationFn: (epic_id: number | null) => {
      if (!issueId) throw new Error('No issue')
      return issueApi.updateEpic(issueId, epic_id)
    },
    onSuccess: () => {
      toast.success(t('issue.epicUpdated'))
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('issue.epicFailed'))),
  })

  if (!issue || !currentIssue) return null

  const availablePriorities = currentIssue.parent
    ? ISSUE_PRIORITIES.filter(
      (p) =>
        PRIORITY_RANK[p.value] >=
        PRIORITY_RANK[currentIssue.parent!.issue_priority]
    )
    : ISSUE_PRIORITIES

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]" onClick={onClose} />
      <div className="relative w-full md:max-w-xl cinder-glass-solid shadow-2xl overflow-y-auto min-h-full max-md:h-dvh">
        <div className="sticky top-0 bg-[#141313]/90 backdrop-blur-md border-b border-jira-border px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-jira-text-subtle font-medium">
            {currentIssue.issue_key}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-jira-text-subtle"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {isIssueWarned(currentIssue) && (
            <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{getWarningLabel(currentIssue)}</span>
            </div>
          )}

          <Input
            label={t('issue.summary')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError('')
            }}
            maxLength={255}
            hint={t('issue.summaryHint')}
            error={titleError}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-jira-text">{t('issue.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={selectClass}
              placeholder={t('common.optional')}
            />
            <span className="text-xs text-jira-text-subtle">{t('issue.descriptionHint')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-jira-text">{t('issue.status')}</label>
              <select
                value={currentIssue.issue_status}
                onChange={(e) => statusMutation.mutate(e.target.value as IssueStatus)}
                className={selectClass}
              >
                {getAllowedStatuses(currentIssue.issue_status, currentIssue.assignee_id).map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">{t('issue.priority')}</label>
              <select
                value={currentIssue.issue_priority}
                onChange={(e) => priorityMutation.mutate(e.target.value as IssuePriority)}
                className={selectClass}
              >
                {availablePriorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {t(`priority.${p.value}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">{t('issue.type')}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IssueType)}
                className={selectClass}
              >
                {(canCreateBug || type === 'bug' ? ISSUE_TYPES : ISSUE_TYPES.filter((item) => item.value !== 'bug')).map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(`type.${item.value}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">{t('issue.epic')}</label>
              <select
                value={String(currentIssue.epic_id ?? '')}
                onChange={(e) => {
                  const v = e.target.value
                  epicMutation.mutate(v === '' ? null : Number(v))
                }}
                className={selectClass}
              >
                <option value="">{t('common.noEpic')}</option>
                {epics.map((e) => (
                  <option key={e.epic_id} value={e.epic_id}>
                    {e.epic_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">{t('issue.assignee')}</label>
              <select
                value={String(currentIssue.assignee_id ?? '')}
                onChange={(e) => {
                  const value = e.target.value
                  assignMutation.mutate(value === '' ? null : Number(value))
                }}
                className={selectClass}
              >
                <option value="">{t('common.unassigned')}</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user.user_name || m.user.user_email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-jira-text">{t('issue.reporter')}</label>
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
              <label className="text-sm font-medium text-jira-text">{t('issue.dueDate')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={selectClass}
              />
            </div>
          </div>
          {currentIssue.issue_type !== 'subtask' && onAddSubtask && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-jira-text">{t('issue.subtasks')}</label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onAddSubtask(currentIssue)}
                >
                  {t('issue.addSubtask')}
                </Button>
              </div>
              {currentIssue.subtasks && currentIssue.subtasks.length > 0 ? (
                <ul className="text-sm text-jira-text space-y-1">
                  {currentIssue.subtasks.map((s) => (
                    <li key={s.issue_id} className="text-jira-text-subtle">
                      {s.issue_key} · {s.issue_priority}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-jira-text-subtle">{t('issue.noSubtasks')}</p>
              )}
            </div>
          )}

          {saveError && <p className="text-sm text-red-500">{saveError}</p>}

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || title.length < 3}
          >
            {updateMutation.isPending ? t('common.saving') : t('settings.saveChanges')}
          </Button>


          {issueId && (
            <IssueAttachments issueId={issueId} projectId={projectId} />
          )}

          <div className="pt-4 border-t border-jira-border">
            <h3 className="text-sm font-semibold text-jira-text-subtle mb-3">
              {t('issue.comments', { count: comments.length })}
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
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: dateLocale })}
                      </span>
                      {isOwnComment(c.user_id) && editingCommentId !== c.comment_id && (
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            title={t('common.edit')}
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
                            title={t('common.delete')}
                            onClick={() => {
                              if (window.confirm(t('issue.confirmDeleteComment'))) {
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
                            {t('common.save')}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditText('')
                            }}
                          >
                            {t('common.cancel')}
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
                placeholder={t('issue.addComment')}
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
                if (window.confirm(t('issue.confirmDelete'))) {
                  deleteMutation.mutate()
                }
              }}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('issue.deleteIssue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
