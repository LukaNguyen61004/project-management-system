import { en, type Messages } from './en'
import { vi } from './vi'
import type { Locale } from '../store/locale.store'

export const messages: Record<Locale, Messages> = { en, vi }