export enum IncidentStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IncidentSeverity {
  CRITICAL = 'critical', // P1
  HIGH = 'high',         // P2
  MEDIUM = 'medium',     // P3
  LOW = 'low',           // P4
}

export enum ServiceStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  PARTIAL_OUTAGE = 'partial_outage',
  MAJOR_OUTAGE = 'major_outage',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum NotificationType {
  INCIDENT_CREATED = 'incident_created',
  INCIDENT_ASSIGNED = 'incident_assigned',
  INCIDENT_ACKNOWLEDGED = 'incident_acknowledged',
  INCIDENT_RESOLVED = 'incident_resolved',
  INCIDENT_COMMENTED = 'incident_commented',
  INCIDENT_ESCALATED = 'incident_escalated',
  SERVICE_DOWN = 'service_down',
  SERVICE_RECOVERED = 'service_recovered',
  TEAM_INVITE = 'team_invite',
  ALERT_TRIGGERED = 'alert_triggered',
}

export enum TimelineEventType {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  SEVERITY_CHANGED = 'severity_changed',
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  COMMENTED = 'commented',
  ATTACHMENT_ADDED = 'attachment_added',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum MaintenanceWindowStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ApiKeyPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}
