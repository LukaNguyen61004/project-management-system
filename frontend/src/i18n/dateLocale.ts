import { enUS, vi } from 'date-fns/locale'
import { useLocaleStore } from '../store/locale.store'

export function getDateFnsLocale() {
  return useLocaleStore.getState().locale === 'vi' ? vi : enUS
}

export function useDateFnsLocale() {
  const locale = useLocaleStore((s) => s.locale)
  return locale === 'vi' ? vi : enUS
}
