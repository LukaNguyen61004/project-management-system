import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sprintApi } from '../../api/sprint.api'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { dateInputToISO } from '../../utils/date'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../utils/apiError'

interface CreateSprintModalProps {
  open: boolean
  projectId: number
  onClose: () => void
}

export function CreateSprintModal({ open, projectId, onClose }: CreateSprintModalProps) {
  const queryClient = useQueryClient()
  const [sprintName, setSprintName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const createMutation = useMutation({
    mutationFn: () => sprintApi.create(projectId, { sprint_name: sprintName, start_date: dateInputToISO(startDate), end_date: dateInputToISO(endDate),}),
    onSuccess: () => {
      toast.success('Đã tạo sprint')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      setSprintName('')
      setStartDate('')
      setEndDate('')
      onClose()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Tạo sprint thất bại')),
  })

  const handleClose = () => {
    setSprintName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create sprint">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (sprintName.length >= 3) createMutation.mutate()
        }}
        className="space-y-4"
      >
        <Input
          label="Sprint name"
          value={sprintName}
          onChange={(e) => setSprintName(e.target.value)}
          placeholder="Sprint 1"
          required
          minLength={3}
        />
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
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
