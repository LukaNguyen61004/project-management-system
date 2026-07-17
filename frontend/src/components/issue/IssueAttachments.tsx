import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Link2, Trash2, FileText, Paperclip } from 'lucide-react'
import { attachmentApi } from '../../api/attachment.api'
import { uploadIssueFile } from '../../utils/uploadIssueFile'
import { Button } from '../ui/Button'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface IssueAttachmentsProps {
  issueId: number
  projectId: number
}

export function IssueAttachments({ issueId, projectId }: IssueAttachmentsProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [error, setError] = useState('')

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', issueId],
    queryFn: () => attachmentApi.getByIssue(issueId).then((r) => r.data.data),
    enabled: !!issueId,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attachments', issueId] })
    queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
    queryClient.invalidateQueries({ queryKey: ['issues'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: {
      attachment_type: 'image' | 'file' | 'link'
      file_name: string
      file_url: string
    }) => attachmentApi.create(issueId, data),
    onSuccess: () => {
      setLinkUrl('')
      setLinkName('')
      setError('')
      toast.success('Đã thêm attachment')
      invalidate()
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Failed to add attachment')
      setError(msg)
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) => attachmentApi.delete(attachmentId),
    onSuccess: () => {
      toast.success('Đã xóa attachment')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Xóa attachment thất bại')),
  })

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!linkUrl.trim() || !linkName.trim()) return

    createMutation.mutate({
      attachment_type: 'link',
      file_name: linkName.trim(),
      file_url: linkUrl.trim(),
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    try {
      const { url, attachment_type } = await uploadIssueFile(projectId, issueId, file)
      createMutation.mutate({
        attachment_type,
        file_name: file.name,
        file_url: url,
      })
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to upload file')
      setError(msg)
      toast.error(msg)
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="pt-4 border-t border-jira-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-jira-text-subtle">
          Attachments ({attachments.length})
        </h3>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={createMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={14} />
            {createMutation.isPending ? 'Uploading...' : 'Attach file'}
          </Button>
        </div>
      </div>
      <p className="text-xs text-jira-text-subtle mb-3">Ảnh, PDF, Word… tối đa 10MB/file</p>

      {isLoading ? (
        <p className="text-sm text-jira-text-subtle">Loading attachments...</p>
      ) : attachments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {attachments.map((a) => (
            <div
              key={a.attachment_id}
              className="flex items-center gap-3 p-2 rounded border border-jira-border bg-white"
            >
              {a.attachment_type === 'image' ? (
                <a href={a.file_url} target="_blank" rel="noreferrer">
                  <img
                    src={a.file_url}
                    alt={a.file_name}
                    className="w-12 h-12 object-cover rounded border border-jira-border"
                  />
                </a>
              ) : a.attachment_type === 'file' ? (
                <div className="w-12 h-12 flex items-center justify-center rounded bg-jira-bg">
                  <FileText size={18} className="text-jira-text-subtle" />
                </div>
              ) : (
                <div className="w-12 h-12 flex items-center justify-center rounded bg-jira-bg">
                  <Link2 size={18} className="text-jira-text-subtle" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-jira-blue hover:underline truncate block"
                >
                  {a.file_name}
                </a>
                <p className="text-xs text-jira-text-subtle">
                  {a.user?.user_name || a.user?.user_email} ·{' '}
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </p>
              </div>

              <a
                href={a.file_url}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded hover:bg-gray-100 text-jira-text-subtle"
                title="Open"
              >
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this attachment?')) {
                    deleteMutation.mutate(a.attachment_id)
                  }
                }}
                className="p-1 rounded hover:bg-red-50 text-jira-text-subtle hover:text-red-500"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-jira-text-subtle mb-4">No attachments yet.</p>
      )}

      <form onSubmit={handleAddLink} className="space-y-2">
        <p className="text-xs font-medium text-jira-text-subtle">Add link</p>
        <input
          type="text"
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          placeholder="Link title"
          className="w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue"
        />
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!linkUrl.trim() || !linkName.trim() || createMutation.isPending}
        >
          <Link2 size={14} />
          {createMutation.isPending ? 'Adding...' : 'Add link'}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}