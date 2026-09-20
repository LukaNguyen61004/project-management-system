import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Sprint } from '../../types/sprint.types'
import { useT } from '../../i18n/useT'

interface CompleteSprintModalProps {
  open: boolean
  sprintName: string
  incompleteCount: number
  plannedSprints: Sprint[]
  onClose: () => void
  onConfirm: (moveTo: number | null) => void
  isPending?: boolean
}

export function CompleteSprintModal({
  open,
  sprintName,
  incompleteCount,
  plannedSprints,
  onClose,
  onConfirm,
  isPending,
}: CompleteSprintModalProps) {
  const [moveTo, setMoveTo] = useState<number | null>(null)
  const t = useT()

  return (
    <Modal open={open} onClose={onClose} title={t('sprint.completeTitle', { name: sprintName })}>
      <p className="text-sm text-jira-text mb-4">
        {t('sprint.incompleteHint', { count: incompleteCount })}
      </p>
      <select
        className="w-full rounded-3xl border border-jira-border px-3 py-2 text-sm bg-transparent"
        value={moveTo === null ? 'backlog' : String(moveTo)}
        onChange={(e) =>
          setMoveTo(e.target.value === 'backlog' ? null : Number(e.target.value))
        }
      >
        <option value="backlog">{t('sprint.backlog')}</option>
        {plannedSprints.map((s) => (
          <option key={s.sprint_id} value={s.sprint_id}>
            {s.sprint_name}
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          onClick={() => onConfirm(moveTo)}
          disabled={isPending}
        >
          {isPending ? t('sprint.completing') : t('sprint.completeConfirm')}
        </Button>
      </div>
    </Modal>
  )
}