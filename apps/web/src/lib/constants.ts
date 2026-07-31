export const APP_NAME = 'IncidentOps';
export const APP_DESCRIPTION = 'Enterprise Incident Management Platform';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  INCIDENTS: '/dashboard/incidents',
  SERVICES: '/dashboard/services',
  TEAMS: '/dashboard/teams',
  ANALYTICS: '/dashboard/analytics',
  ON_CALL: '/dashboard/on-call',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
  STATUS: '/status',
} as const;

export const QUERY_KEYS = {
  USER: ['user'] as const,
  INCIDENTS: ['incidents'] as const,
  INCIDENT: (id: string) => ['incident', id] as const,
  SERVICES: ['services'] as const,
  SERVICE: (id: string) => ['service', id] as const,
  TEAMS: ['teams'] as const,
  TEAM: (id: string) => ['team', id] as const,
  ANALYTICS: ['analytics'] as const,
  NOTIFICATIONS: ['notifications'] as const,
  DASHBOARD: ['dashboard'] as const,
} as const;

export const STORAGE_KEYS = {
  THEME: 'incidentops-theme',
  SIDEBAR_COLLAPSED: 'incidentops-sidebar-collapsed',
} as const;
