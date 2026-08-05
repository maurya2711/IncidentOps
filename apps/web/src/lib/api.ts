import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_URL } from './constants';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
}

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for the refresh and logout endpoints themselves
    const isRefreshUrl = originalRequest.url?.includes('/auth/refresh');
    const isLogoutUrl = originalRequest.url?.includes('/auth/logout');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshUrl &&
      !isLogoutUrl
    ) {
      if (isRefreshing) {
        // Queue requests while refresh is in-flight
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // The TransformInterceptor wraps as: { data: { accessToken } }
        // Handle both possible response shapes defensively
        const body = data?.data;
        const newToken = (body?.accessToken ?? body?.data?.accessToken) as string | undefined;

        if (!newToken) {
          throw new Error('No access token in refresh response');
        }

        setAccessToken(newToken);
        onTokenRefreshed(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        onRefreshFailed();
        // Clear the httpOnly cookie on the backend
        await axios
          .post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true })
          .catch(() => {});
        // Use Next.js router-style soft redirect so React can unmount cleanly
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
