import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from './routes/AppRouter'
import { AuthBootstrap } from './components/auth/AuthBootstrap'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}

export default App