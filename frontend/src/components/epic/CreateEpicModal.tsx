import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { epicApi } from '../../api/epic.api'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const COLORS = ['#8B5CF6', '#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0']

interface Props {
  open: boolean
  projectId: number
  onClose: () => void
}

export function CreateEpicModal({ open, projectId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const mutation = useMutation({
    mutationFn: () =>
      epicApi.create(projectId, { epic_name: name, epic_color: color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] })
      setName('')
      setColor(COLORS[0])
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Create epic">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) mutation.mutate()
        }}
        className="space-y-4"
      >
        <Input
          label="Epic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="User Authentication"
          required
          minLength={1}
        />

        <div>
          <label className="text-sm font-medium text-jira-text">Color</label>
          <div className="flex gap-2 mt-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? '#172b4d' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !name.trim()}>
            {mutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}