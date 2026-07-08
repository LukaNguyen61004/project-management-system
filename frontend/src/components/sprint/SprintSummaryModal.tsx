import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import type { SprintSummaryResult } from '../../api/ai.api'

interface SprintSummaryModalProps {
  open: boolean
  onClose: () => void
  sprintName: string
  data: SprintSummaryResult | null
  loading?: boolean
}

export function SprintSummaryModal({
  open,
  onClose,
  sprintName,
  data,
  loading,
}: SprintSummaryModalProps) {
  const handleCopy = () => {
    if (data?.summary) navigator.clipboard.writeText(data.summary)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Sprint Summary — ${sprintName}`} size="lg">
      {loading ? (
        <p className="text-sm text-jira-text-subtle">Đang tạo tóm tắt với AI...</p>
      ) : data ? (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex gap-4 p-3 bg-jira-bg rounded-lg text-sm">
            <span><strong>{data.stats.completion_rate}</strong> hoàn thành</span>
            <span>{data.stats.done}/{data.stats.total} done</span>
            {data.stats.in_review > 0 && (
              <span className="text-purple-600">{data.stats.in_review} in review</span>
            )}
            {data.stats.in_progress > 0 && (
              <span className="text-blue-600">{data.stats.in_progress} in progress</span>
            )}
            {data.stats.todo > 0 && (
              <span className="text-gray-500">{data.stats.todo} todo</span>
            )}
          </div>

          {/* AI summary — render markdown đơn giản */}
          <div className="prose prose-sm max-w-none text-jira-text whitespace-pre-wrap text-sm leading-relaxed">
            {data.summary}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              Copy
            </Button>
            <Button size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-red-500">Không tạo được tóm tắt.</p>
      )}
    </Modal>
  )
}