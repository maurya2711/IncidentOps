'use client';

import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { setAccessToken, getAccessToken } from '@/lib/api';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

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
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: logoutStore } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.data.user);
      setAccessToken(getAccessToken());
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logoutStore();
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, logoutStore]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.data.auth.accessToken);
      setUser(data.data.auth.user);
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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Logout failed');
      // Force logout even on error
      logoutStore();
      setAccessToken(null);
    },
  });

  const login = useCallback(async (data: { email: string; password: string; rememberMe?: boolean }) => {
    await loginMutation.mutateAsync(data);
  }, [loginMutation]);

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
