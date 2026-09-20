import { useLocaleStore } from '../store/locale.store'
import { messages } from './messages'

type NestedKey<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : NestedKey<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type MessageKey = NestedKey<typeof import('./en').en>

function getPath(obj: unknown, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
  return typeof value === 'string' ? value : path
}

export function t(key: MessageKey, vars?: Record<string, string | number>) {
  const locale = useLocaleStore.getState().locale
  let text = getPath(messages[locale], key)
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{{${k}}}`, String(v))
    }
  }
  return text
}

export function useT() {
  useLocaleStore((s) => s.locale)
  return t
}
