export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
export declare const TIME: {
    readonly ACCESS_TOKEN_EXPIRY: "15m";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly REFRESH_TOKEN_REMEMBER_EXPIRY: "30d";
    readonly PASSWORD_RESET_TTL_MS: number;
    readonly EMAIL_VERIFICATION_TTL_MS: number;
    readonly SESSION_CLEANUP_INTERVAL_MS: number;
};
export declare const BCRYPT_ROUNDS = 12;
export declare const RATE_LIMIT: {
    readonly AUTH_WINDOW_MS: number;
    readonly AUTH_MAX_REQUESTS: 10;
    readonly API_WINDOW_MS: number;
    readonly API_MAX_REQUESTS: 100;
};
export declare const SLA_TARGETS: {
    readonly critical: 60;
    readonly high: 240;
    readonly medium: 1440;
    readonly low: 4320;
};
export declare const STATUS_PAGE: {
    readonly UPTIME_DAYS: 90;
    readonly INCIDENT_HISTORY_DAYS: 30;
    readonly AUTO_REFRESH_MS: number;
};
//# sourceMappingURL=index.d.ts.map