import { useLocaleStore } from '../../store/locale.store'

export function LanguageToggle() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)

  return (
    <div className="flex items-center rounded-full border border-white/30 text-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 ${locale === 'en' ? 'bg-white/20 text-white' : 'text-white/60'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('vi')}
        className={`px-2 py-1 ${locale === 'vi' ? 'bg-white/20 text-white' : 'text-white/60'}`}
      >
        VI
      </button>
    </div>
  )
}