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

type SummarySection = { title: string; body: string }

function cleanSummaryText(raw: string): string {
  return raw
    .replace(/^#\s+[^\n]+\n?/gm, '')
    .replace(/(^|\n)\s*Kính\s+gửi\s+Manager[,]?\s*/gi, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseSummarySections(markdown: string): SummarySection[] {
  const text = cleanSummaryText(markdown)
  if (!text) return []

  const parts = text.split(/\n(?=##\s+)/)
  return parts
    .map((part) => {
      const lines = part.trim().split('\n')
      const first = lines[0] ?? ''
      const match = first.match(/^##\s+(.+)$/)
      if (match) {
        return {
          title: match[1].trim(),
          body: lines.slice(1).join('\n').trim(),
        }
      }
      return { title: '', body: part.trim() }
    })
    .filter((s) => {
      if (!s.title && !s.body) return false
      // Bỏ section tiến độ member do AI (UI đã có bảng riêng)
      if (s.title.toLowerCase().includes('tiến độ') && s.title.toLowerCase().includes('member')) {
        return false
      }
      return true
    })
}

/** Bỏ dòng separator markdown table |:---| */
function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line.trim())
}

function isTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith('|') && t.includes('|')
}

function stripMdNoise(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[\s]*[-*•]\s+/, '')
    .trim()
}

type BodyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

function parseBodyBlocks(body: string): BodyBlock[] {
  const lines = body.split('\n')
  const blocks: BodyBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Markdown table
    if (isTableRow(trimmed)) {
      const tableLines: string[] = []
      while (i < lines.length && isTableRow((lines[i] ?? '').trim())) {
        const row = (lines[i] ?? '').trim()
        if (!isTableSeparator(row)) tableLines.push(row)
        i++
      }
      const parsed = tableLines.map((row) =>
        row
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => stripMdNoise(c))
      )
      if (parsed.length >= 1) {
        const [headers, ...rows] = parsed
        blocks.push({ type: 'table', headers: headers ?? [], rows })
      }
      continue
    }

    // Bullet list (*, -, •)
    if (/^[-*•]\s+/.test(trimmed) || /^\*\s+\*\*/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length) {
        const l = (lines[i] ?? '').trim()
        if (!l) break
        if (/^[-*•]\s+/.test(l) || /^\*\s+/.test(l)) {
          items.push(stripMdNoise(l))
          i++
          continue
        }
        // nested continuation under bullet
        if (/^\*\*/.test(l) || /^[A-ZÀ-ỹ]/.test(l) === false && items.length) {
          break
        }
        break
      }
      if (items.length) blocks.push({ type: 'ul', items })
      continue
    }

    blocks.push({ type: 'p', text: stripMdNoise(trimmed) })
    i++
  }

  return blocks
}

function SectionBody({ body }: { body: string }) {
  const blocks = parseBodyBlocks(body)

  if (blocks.length === 0) return null

  return (
    <div className="px-3 py-2.5 text-sm text-jira-text space-y-2">
      {blocks.map((b, idx) => {
        if (b.type === 'p') {
          return (
            <p key={idx} className="leading-relaxed">
              {b.text}
            </p>
          )
        }
        if (b.type === 'ul') {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 leading-relaxed">
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )
        }
        return (
          <div key={idx} className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-jira-border text-left text-jira-text-subtle">
                  {b.headers.map((h, hi) => (
                    <th key={hi} className="py-1 pr-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-jira-border/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-1 pr-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

function sectionStyle(title: string): { wrap: string; head: string } {
  const t = title.toLowerCase()
  if (t.includes('highlight') || t.includes('manager')) {
    return {
      wrap: 'border-amber-200 bg-amber-50/40',
      head: 'bg-amber-100 text-amber-950 border-amber-200',
    }
  }
  if (t.includes('đã hoàn thành')) {
    return {
      wrap: 'border-emerald-200 bg-emerald-50/30',
      head: 'bg-emerald-100 text-emerald-950 border-emerald-200',
    }
  }
  if (t.includes('chưa hoàn thành')) {
    return {
      wrap: 'border-orange-200 bg-orange-50/30',
      head: 'bg-orange-100 text-orange-950 border-orange-200',
    }
  }
  if (t.includes('đáng chú ý') || t.includes('rủi ro')) {
    return {
      wrap: 'border-rose-200 bg-rose-50/30',
      head: 'bg-rose-100 text-rose-950 border-rose-200',
    }
  }
  if (t.includes('gợi ý') || t.includes('tiếp theo')) {
    return {
      wrap: 'border-sky-200 bg-sky-50/30',
      head: 'bg-sky-100 text-sky-950 border-sky-200',
    }
  }
  if (t.includes('tiến độ') || t.includes('member')) {
    return {
      wrap: 'border-indigo-200 bg-indigo-50/30',
      head: 'bg-indigo-100 text-indigo-950 border-indigo-200',
    }
  }
  if (t.includes('thay đổi') || t.includes('estimate') || t.includes('lịch')) {
    return {
      wrap: 'border-violet-200 bg-violet-50/30',
      head: 'bg-violet-100 text-violet-950 border-violet-200',
    }
  }
  if (t.includes('tổng quan')) {
    return {
      wrap: 'border-slate-200 bg-slate-50/40',
      head: 'bg-slate-100 text-slate-900 border-slate-200',
    }
  }
  return {
    wrap: 'border-jira-border bg-white',
    head: 'bg-jira-bg text-jira-text border-jira-border',
  }
}

function SummarySections({ markdown }: { markdown: string }) {
  const sections = parseSummarySections(markdown)

  if (sections.length === 0) {
    return <SectionBody body={cleanSummaryText(markdown)} />
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => {
        if (!section.title) {
          return <SectionBody key={`plain-${i}`} body={section.body} />
        }

        const style = sectionStyle(section.title)
        return (
          <section
            key={`${section.title}-${i}`}
            className={`rounded-lg border overflow-hidden ${style.wrap}`}
          >
            <header className={`px-3 py-2 text-sm font-semibold border-b ${style.head}`}>
              {section.title}
            </header>
            {section.body ? <SectionBody body={section.body} /> : null}
          </section>
        )
      })}
    </div>
  )
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

  const membersBelow100 =
    data?.member_progress?.filter((m) => m.completion_pct < 100).length ?? 0

  return (
    <Modal open={open} onClose={onClose} title={`Sprint Summary — ${sprintName}`} size="lg">
      {loading ? (
        <p className="text-sm text-jira-text-subtle">Đang tạo tóm tắt với AI...</p>
      ) : data ? (
        <div className="space-y-4">
          {data.manager_stats && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm space-y-1">
              <p className="font-semibold text-amber-900">Highlight cho Manager</p>
              <p>
                Hoàn thành:{' '}
                <strong>{data.manager_stats.completion_rate}</strong> ({data.manager_stats.done}/
                {data.manager_stats.total})
              </p>
              <p>
                Overdue: <strong>{data.manager_stats.overdue_count}</strong>
                {data.manager_stats.overdue_keys.length > 0 &&
                  ` (${data.manager_stats.overdue_keys.join(', ')})`}
              </p>
              <p>Unassigned: {data.manager_stats.unassigned_count}</p>
              <p>Member chưa 100%: {membersBelow100}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 p-3 bg-jira-bg rounded-lg text-sm">
            <span>
              <strong>{data.stats.completion_rate}</strong> hoàn thành
            </span>
            <span>
              {data.stats.done}/{data.stats.total} done
            </span>
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

          {data.member_progress?.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-sm font-semibold text-jira-text mb-2">Tiến độ theo member</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-jira-text-subtle border-b border-jira-border">
                    <th className="py-1.5 pr-2">Member</th>
                    <th className="py-1.5 pr-2">Assigned</th>
                    <th className="py-1.5 pr-2">Done</th>
                    <th className="py-1.5 pr-2">%</th>
                    <th className="py-1.5">Còn lại</th>
                  </tr>
                </thead>
                <tbody>
                  {data.member_progress.map((m) => (
                    <tr key={m.name} className="border-b border-jira-border/60">
                      <td className="py-1.5 pr-2">{m.name}</td>
                      <td className="py-1.5 pr-2">{m.assigned}</td>
                      <td className="py-1.5 pr-2">{m.done}</td>
                      <td
                        className={`py-1.5 pr-2 ${
                          m.completion_pct < 100 ? 'text-red-600 font-medium' : 'text-green-700'
                        }`}
                      >
                        {m.completion_pct}%
                      </td>
                      <td className="py-1.5 text-xs text-jira-text-subtle">
                        {m.incomplete_keys.join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-jira-border pt-3">
            <SummarySections markdown={data.summary} />
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
