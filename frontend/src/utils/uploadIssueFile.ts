export type UploadedAttachment = {
  url: string
  attachment_type: 'image' | 'file'
}

/** Cloudinary free ~10MB/file — giữ đồng bộ với preset */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.txt',
]

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot).toLowerCase() : ''
}

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1)
}

export function validateIssueFile(file: File): string | null {
  const ext = getFileExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Định dạng không hỗ trợ: ${ext || 'unknown'}`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File ${formatMb(file.size)}MB — tối đa ${formatMb(MAX_FILE_SIZE_BYTES)}MB. Nén file hoặc dùng Add link (Google Drive).`
  }
  return null
}

export async function uploadIssueFile(
  projectId: number,
  issueId: number,
  file: File
): Promise<UploadedAttachment> {
  const validationError = validateIssueFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Chưa cấu hình Cloudinary — thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào .env, restart npm run dev'
    )
  }

  const image = isImageFile(file)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `issues/${projectId}/${issueId}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  )

  const data = (await res.json()) as {
    secure_url?: string
    error?: { message?: string }
  }

  if (!res.ok) {
    throw new Error(data.error?.message || 'Upload Cloudinary thất bại')
  }

  if (!data.secure_url) {
    throw new Error('Cloudinary không trả về URL')
  }

  return {
    url: data.secure_url,
    attachment_type: image ? 'image' : 'file',
  }
}
