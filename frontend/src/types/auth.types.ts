import type { AuthProvider } from './enums'

export interface User {
  user_id: number
  user_email: string
  user_name: string | null
  user_avatar_url: string | null
  provider: AuthProvider
  user_created_at: string
  user_updated_at: string
}

export interface LoginResponse {
  message: string
  data: {
    safeUser: User
    accessToken: string
  }
}

export interface RegisterResponse {
  message: string
  user: User
}

export interface GoogleLoginResponse {
  message: string
  data: {
    safeUser: User
    accessToken: string
  }
}
