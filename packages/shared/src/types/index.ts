import {
  IncidentSeverity,
  IncidentStatus,
  NotificationType,
  ServiceStatus,
  TeamRole,
  TimelineEventType,
  UserRole,
} from '../enums';

// ─── Base Types ───────────────────────────────────────────────────────────────

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  timezone: string;
  bio?: string;
  phoneNumber?: string;
}

export interface UserPublic {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified?: boolean;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  user: UserPublic;
  role: TeamRole;
  joinedAt: string;
  isAvailable: boolean;
}

export interface Team extends BaseEntity {
  name: string;
  description?: string;
  members: TeamMember[];
  slackChannel?: string;
  escalationPolicy?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export interface ServiceMetricPoint {
  timestamp: string;
  latency: number;
  errorRate: number;
  requestCount: number;
}

export interface Service extends BaseEntity {
  name: string;
  description?: string;
  status: ServiceStatus;
  team?: Team;
  uptime: number;
  latency: number;
  errorRate: number;
  dependencies: Array<{ service: string; name: string; status: ServiceStatus }>;
  statusBadgeToken: string;
  tags: string[];
}

// ─── Incident ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  _id: string;
  type: TimelineEventType;
  description: string;
  actor?: UserPublic;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: UserPublic;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: UserPublic;
  createdAt: string;
}

export interface Incident extends BaseEntity {
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignee?: UserPublic;
  service?: Service;
  team?: Team;
  tags: string[];
  timeline: TimelineEvent[];
  comments: Comment[];
  attachments: Attachment[];
  resolvedAt?: string;
  acknowledgedAt?: string;
  incidentNumber: number;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  actor?: UserPublic;
}

// ─── API Key ──────────────────────────────────────────────────────────────────

export interface ApiKey extends BaseEntity {
  name: string;
  prefix: string;
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session extends BaseEntity {
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface IncidentTrendPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface MTTRData {
  averageMinutes: number;
  trend: number; // percentage change vs previous period
  bySeverity: Record<IncidentSeverity, number>;
}

export interface SLACompliance {
  severity: IncidentSeverity;
  target: number;
  actual: number;
  compliance: number;
}

export interface AnalyticsSummary {
  totalIncidents: number;
  activeIncidents: number;
  resolvedToday: number;
  averageUptimePercent: number;
  mttr: number;
  mttd: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}
