import { isAxiosError } from 'axios'
import { FirebaseError } from 'firebase/app'

type ZodIssue = { message?: string }

function parseZodIssues(value: unknown): string | null {
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => (typeof item === 'object' && item && 'message' in item ? String(item.message) : ''))
      .filter(Boolean)
    return messages.length > 0 ? messages.join('. ') : null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return parseZodIssues(JSON.parse(trimmed))
      } catch {
        return value
      }
    }
    return value
  }

  return null
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/popup-closed-by-user') {
      return 'Đã hủy đăng nhập Google'
    }
    return error.message || fallback
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: unknown } | undefined
    const parsed = parseZodIssues(data?.error)
    if (parsed) return parsed

    if (error.response?.status === 401) {
      return 'Backend từ chối đăng nhập Google (kiểm tra email đã đăng ký bằng password chưa)'
    }
    if (!error.response) {
      return 'Không kết nối được backend — hãy chạy backend (port 5000)'
    }
  }

  if (error instanceof Error && error.message) {
    const parsed = parseZodIssues(error.message)
    if (parsed) return parsed
    return error.message
  }

  return fallback
}
