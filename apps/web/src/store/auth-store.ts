import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserPublic } from '@incidentops/shared';

interface AuthStore {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserPublic | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      // Only persist the isAuthenticated flag, we'll fetch the fresh user data on load
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    },
  ),
);
