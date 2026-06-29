import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Sprint } from '../../types/sprint.types'
import { sprintApi } from '../../api/sprint.api'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { dateInputToISO, isoToDateInput } from '../../utils/date'

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

  useEffect(() => {
    if (sprint) {
      setName(sprint.sprint_name)
      setDescription(sprint.description || '')
      setStartDate(isoToDateInput(sprint.start_date))
      setEndDate(isoToDateInput(sprint.end_date))
    }
  }, [sprint?.sprint_id, sprint?.sprint_name, sprint?.description, sprint?.start_date, sprint?.end_date])

  const updateMutation = useMutation({
    mutationFn: () =>
      sprintApi.update(sprint!.sprint_id, {
        sprint_name: name,
        description: description || undefined,
        start_date: dateInputToISO(startDate),
        end_date: dateInputToISO(endDate),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Edit sprint">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.length >= 3) updateMutation.mutate()
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
