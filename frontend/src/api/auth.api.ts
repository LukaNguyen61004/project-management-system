import { apiClient } from './client'

import type { GoogleLoginResponse, LoginResponse, RegisterResponse, User } from '../types/auth.types'



export const authApi = {

  register: (user_email: string, user_password: string) =>

    apiClient.post<RegisterResponse>('/auth/register', { user_email, user_password }),

  login: (user_email: string, user_password: string) =>

    apiClient.post<LoginResponse>('/auth/login', { user_email, user_password }),

  googleLogin: (idToken: string) =>

    apiClient.post<GoogleLoginResponse>('/auth/google', { idToken }),

  getMe: () => apiClient.get<{ data: User }>('/auth/me'),

  updateProfile: (data: { user_name?: string; user_avatar_url?: string }) =>

    apiClient.patch<{ success: boolean; data: User }>('/auth/me', data),

  logout: () =>

    apiClient.post<{ success: boolean; data: { message: string } }>('/auth/logout')

}

