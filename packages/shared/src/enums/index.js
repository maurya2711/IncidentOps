"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyPermission = exports.MaintenanceWindowStatus = exports.TimelineEventType = exports.NotificationType = exports.TeamRole = exports.UserRole = exports.ServiceStatus = exports.IncidentSeverity = exports.IncidentStatus = void 0;
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["OPEN"] = "open";
    IncidentStatus["ACKNOWLEDGED"] = "acknowledged";
    IncidentStatus["INVESTIGATING"] = "investigating";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["CRITICAL"] = "critical";
    IncidentSeverity["HIGH"] = "high";
    IncidentSeverity["MEDIUM"] = "medium";
    IncidentSeverity["LOW"] = "low";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["OPERATIONAL"] = "operational";
    ServiceStatus["DEGRADED"] = "degraded";
    ServiceStatus["PARTIAL_OUTAGE"] = "partial_outage";
    ServiceStatus["MAJOR_OUTAGE"] = "major_outage";
    ServiceStatus["MAINTENANCE"] = "maintenance";
    ServiceStatus["UNKNOWN"] = "unknown";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["MEMBER"] = "member";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
var TeamRole;
(function (TeamRole) {
    TeamRole["OWNER"] = "owner";
    TeamRole["ADMIN"] = "admin";
    TeamRole["MEMBER"] = "member";
    TeamRole["VIEWER"] = "viewer";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["INCIDENT_CREATED"] = "incident_created";
    NotificationType["INCIDENT_ASSIGNED"] = "incident_assigned";
    NotificationType["INCIDENT_ACKNOWLEDGED"] = "incident_acknowledged";
    NotificationType["INCIDENT_RESOLVED"] = "incident_resolved";
    NotificationType["INCIDENT_COMMENTED"] = "incident_commented";
    NotificationType["INCIDENT_ESCALATED"] = "incident_escalated";
    NotificationType["SERVICE_DOWN"] = "service_down";
    NotificationType["SERVICE_RECOVERED"] = "service_recovered";
    NotificationType["TEAM_INVITE"] = "team_invite";
    NotificationType["ALERT_TRIGGERED"] = "alert_triggered";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var TimelineEventType;
(function (TimelineEventType) {
    TimelineEventType["CREATED"] = "created";
    TimelineEventType["STATUS_CHANGED"] = "status_changed";
    TimelineEventType["SEVERITY_CHANGED"] = "severity_changed";
    TimelineEventType["ASSIGNED"] = "assigned";
    TimelineEventType["UNASSIGNED"] = "unassigned";
    TimelineEventType["COMMENTED"] = "commented";
    TimelineEventType["ATTACHMENT_ADDED"] = "attachment_added";
    TimelineEventType["ESCALATED"] = "escalated";
    TimelineEventType["RESOLVED"] = "resolved";
    TimelineEventType["CLOSED"] = "closed";
})(TimelineEventType || (exports.TimelineEventType = TimelineEventType = {}));
var MaintenanceWindowStatus;
(function (MaintenanceWindowStatus) {
    MaintenanceWindowStatus["SCHEDULED"] = "scheduled";
    MaintenanceWindowStatus["IN_PROGRESS"] = "in_progress";
    MaintenanceWindowStatus["COMPLETED"] = "completed";
    MaintenanceWindowStatus["CANCELLED"] = "cancelled";
})(MaintenanceWindowStatus || (exports.MaintenanceWindowStatus = MaintenanceWindowStatus = {}));
var ApiKeyPermission;
(function (ApiKeyPermission) {
    ApiKeyPermission["READ"] = "read";
    ApiKeyPermission["WRITE"] = "write";
    ApiKeyPermission["ADMIN"] = "admin";
})(ApiKeyPermission || (exports.ApiKeyPermission = ApiKeyPermission = {}));
//# sourceMappingURL=index.js.map