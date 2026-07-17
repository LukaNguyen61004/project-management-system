import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Sprint } from '../../types/sprint.types'
import { sprintApi } from '../../api/sprint.api'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { dateInputToISO, isoToDateInput } from '../../utils/date'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../utils/apiError'

interface EditSprintModalProps {
  open: boolean
  sprint: Sprint | null
  projectId: number
  onClose: () => void
}

export function EditSprintModal({ open, sprint, projectId, onClose }: EditSprintModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const startRescheduled =
    !!sprint?.start_date &&
    startDate !== isoToDateInput(sprint.start_date)

  const endRescheduled =
    !!sprint?.end_date &&
    endDate !== isoToDateInput(sprint.end_date)

  const needsReason = startRescheduled || endRescheduled


  useEffect(() => {
    if (sprint) {
      setName(sprint.sprint_name)
      setDescription(sprint.description || '')
      setStartDate(isoToDateInput(sprint.start_date))
      setEndDate(isoToDateInput(sprint.end_date))
      setReason('')
      setError('')
    }
  }, [sprint?.sprint_id, sprint?.sprint_name, sprint?.description, sprint?.start_date, sprint?.end_date])


  const updateMutation = useMutation({
    mutationFn: () =>
      sprintApi.update(sprint!.sprint_id, {
        sprint_name: name,
        description: description || undefined,
        start_date: dateInputToISO(startDate),
        end_date: dateInputToISO(endDate),
        ...(needsReason ? { reason: reason.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success('Đã lưu sprint')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      onClose()
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Lưu sprint thất bại')
      setError(msg)
      toast.error(msg)
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Edit sprint">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.length < 3) return
          if (needsReason && reason.trim().length < 3) {
            setError('Cần lý do (ít nhất 3 ký tự) khi đổi ngày sprint')
            return
          }
          updateMutation.mutate()
        }}
        className="space-y-4"
      >
        <Input
          label="Sprint name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
        />
        <div>
          <label className="text-sm font-medium text-jira-text">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue"
            placeholder="Optional..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-jira-text">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-jira-text">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        {needsReason && (
          <div>
            <label className="text-sm font-medium text-jira-text">
              Lý do thay đổi ngày
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm"
              placeholder="Ví dụ: dời deadline vì scope tăng..."
            />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending || name.length < 3}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
