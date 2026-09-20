import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from './routes/AppRouter'
import { AuthBootstrap } from './components/auth/AuthBootstrap'
import { Toaster } from 'sonner'
import { useLocaleStore } from './store/locale.store'

const queryClient = new QueryClient()

function LocaleHtmlLang() {
  const locale = useLocaleStore((s) => s.locale)
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleHtmlLang />
      <Toaster position="top-right" richColors closeButton theme="dark" />
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}

export default App