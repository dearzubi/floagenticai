export const LOG_CONFIG = {
  datePattern: "YYYY-MM-DD",
  timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  maxSize: "20m",
  retentionPeriods: {
    default: "14d",
    errors: "30d",
  },
} as const;

export const LOG_PATHS = {
  combined: "backend-combined-%DATE%.log",
  error: "backend-error-%DATE%.log",
  http: "backend-http-%DATE%.log",
} as const;

export const MORGAN_FORMAT =
  ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
