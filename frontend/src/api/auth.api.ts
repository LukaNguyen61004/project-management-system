import { apiClient } from './client'
import type { LoginResponse, RegisterResponse, User } from '../types/auth.types'

export interface GoogleLoginResponse {
  message: string
  user: {
    user: User
    accessToken: string
  }
}

export const authApi = {
  register: (user_email: string, user_password: string) =>
    apiClient.post<RegisterResponse>('/auth/register', { user_email, user_password }),

  login: (user_email: string, user_password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { user_email, user_password }),

  googleLogin: (idToken: string) =>
    apiClient.post<GoogleLoginResponse>('/auth/google', { idToken }),

  getMe: () => apiClient.get<{ data: User }>('/auth/me'),

  logout: () =>
    apiClient.post<{ success: boolean; data: { message: string } }>('/auth/logout')
}
