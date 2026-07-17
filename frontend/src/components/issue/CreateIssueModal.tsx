import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { issueApi } from '../../api/issue.api'
import { ISSUE_TYPES, ISSUE_PRIORITIES } from '../../utils/constants'
import type { IssueType, IssuePriority } from '../../types/enums'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'sonner'

interface CreateIssueModalProps {
  open: boolean
  onClose: () => void
  projectId: number
}

const selectClass =
  'mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue'

export function CreateIssueModal({ open, onClose, projectId }: CreateIssueModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<IssueType>('task')
  const [priority, setPriority] = useState<IssuePriority>('medium')

  const mutation = useMutation({
    mutationFn: () =>
      issueApi.create(projectId, {
        issue_name: title,
        issue_description: description || undefined,
        issue_type: type,
        issue_priority: priority,
      }),
    onSuccess: () => {
      toast.success('Đã tạo issue')
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
      resetForm()
      onClose()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Tạo issue thất bại')),
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setType('task')
    setPriority('medium')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.length < 3) return
    mutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create issue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Summary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          minLength={3}
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
            <label className="text-sm font-medium text-jira-text">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
              className={selectClass}
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-jira-text">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              className={selectClass}
            >
              {ISSUE_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500">
            {getApiErrorMessage(mutation.error, 'Failed to create issue')}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || title.length < 3}>
            {mutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}