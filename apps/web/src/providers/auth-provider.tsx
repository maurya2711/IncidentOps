'use client';

import { type ReactNode, createContext, useCallback, useContext, useEffect, useRef } from 'react';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { getAccessToken, setAccessToken } from '@/lib/api';
import { authApi } from '@/lib/api/auth';
import { API_URL } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuthStore>['state']['user'] | null;
  login: (data: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    logout: logoutStore,
  } = useAuthStore();
  const initDone = useRef(false);

  // On mount: if we believe the user was authenticated (via persisted store),
  // proactively call /auth/refresh with the httpOnly cookie to get a fresh
  // access token, then fetch user profile. This avoids the interceptor
  // retry chain and gives us a deterministic loading state.
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const storedIsAuth = useAuthStore.getState().isAuthenticated;
    const inMemoryToken = getAccessToken();

    if (!storedIsAuth && !inMemoryToken) {
      // Definitely not authenticated — stop loading immediately
      setLoading(false);
      return;
    }

    // We might have a valid session — try to hydrate
    setLoading(true);
    bootstrapSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 1) Try to get a fresh access token via the refresh cookie.
   * 2) Then fetch /auth/me with the new token.
   * If either step fails, clear auth state.
   */
  const bootstrapSession = async () => {
    try {
      // Step 1: refresh token → new access token
      const refreshRes = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const body = refreshRes.data?.data;
      const newToken = (body?.accessToken ?? body?.data?.accessToken) as string | undefined;

      if (!newToken) throw new Error('No access token returned from refresh');
      setAccessToken(newToken);

      // Step 2: get user profile with the fresh token
      const meRes = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${newToken}` },
      });
      const meBody = meRes.data?.data;
      const fetchedUser = meBody?.user ?? meBody;

      if (!fetchedUser?._id) throw new Error('Could not parse user from /auth/me');
      setUser(fetchedUser);
    } catch (err) {
      console.warn('[AuthProvider] Session bootstrap failed:', err);
      logoutStore();
      setAccessToken(null);
      // Clear the stale httpOnly cookie silently
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    await bootstrapSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Shape: axios.data → response body → { data: { accessToken, user } }
      const payload = data?.data?.data ?? data?.data;
      setAccessToken(payload?.accessToken);
      setUser(payload?.user);
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logoutStore();
      setAccessToken(null);
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Force logout even on error
      logoutStore();
      setAccessToken(null);
    },
  });

  const login = useCallback(
    async (data: { email: string; password: string; rememberMe?: boolean }) => {
      await loginMutation.mutateAsync(data);
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
        user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
