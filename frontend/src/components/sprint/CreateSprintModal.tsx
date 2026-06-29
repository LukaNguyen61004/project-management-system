import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sprintApi } from '../../api/sprint.api'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface CreateSprintModalProps {
  open: boolean
  projectId: number
  onClose: () => void
}

export function CreateSprintModal({ open, projectId, onClose }: CreateSprintModalProps) {
  const queryClient = useQueryClient()
  const [sprintName, setSprintName] = useState('')

  const createMutation = useMutation({
    mutationFn: () => sprintApi.create(projectId, { sprint_name: sprintName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      setSprintName('')
      onClose()
    },
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
