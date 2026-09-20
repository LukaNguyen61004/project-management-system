import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'en' | 'vi'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set({ locale: get().locale === 'en' ? 'vi' : 'en' }),
    }),
    { name: 'cinder-locale' }
  )
)