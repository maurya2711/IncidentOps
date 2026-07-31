export type { UserPublic as User } from '@incidentops/shared';

export interface AuthState {
  user: import('@incidentops/shared').UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notificationDrawerOpen: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
