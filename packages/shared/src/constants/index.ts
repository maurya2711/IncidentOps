export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const TIME = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_REMEMBER_EXPIRY: '30d',
  PASSWORD_RESET_TTL_MS: 60 * 60 * 1000, // 1 hour
  EMAIL_VERIFICATION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  SESSION_CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour
} as const;

export const BCRYPT_ROUNDS = 12;

export const RATE_LIMIT = {
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 10,
  API_WINDOW_MS: 60 * 1000, // 1 minute
  API_MAX_REQUESTS: 100,
} as const;

export const SLA_TARGETS = {
  critical: 60, // minutes
  high: 240,
  medium: 1440,
  low: 4320,
} as const;

export const STATUS_PAGE = {
  UPTIME_DAYS: 90,
  INCIDENT_HISTORY_DAYS: 30,
  AUTO_REFRESH_MS: 60 * 1000,
} as const;
