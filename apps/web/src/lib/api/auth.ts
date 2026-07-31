import { api } from '../api';
import type { UserPublic } from '@incidentops/shared';

export interface LoginResponse {
  auth: {
    accessToken: string;
    user: UserPublic;
  };
  refreshToken: string;
  refreshExpiry: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  refreshExpiry?: string;
}

export const authApi = {
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<{ data: LoginResponse }>('/auth/login', data),

  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ data: RegisterResponse }>('/auth/register', data),

  logout: () => api.post<{ data: { message: string } }>('/auth/logout'),

  logoutAll: () => api.post<{ data: { message: string } }>('/auth/logout-all'),

  refresh: () => api.post<{ data: RefreshResponse }>('/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post<{ data: ForgotPasswordResponse }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ data: ResetPasswordResponse }>('/auth/reset-password', { token, password }),

  getMe: () => api.get<{ data: { user: UserPublic } }>('/auth/me'),
};
