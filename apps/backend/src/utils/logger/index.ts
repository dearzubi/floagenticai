import winston from "winston";
import morgan from "morgan";
import {
  createConsoleTransport,
  createFileTransport,
  createHTTPFileTransport,
} from "./transports.js";
import { LOG_CONFIG, LOG_PATHS, MORGAN_FORMAT } from "./constants.js";
import { createHttpFormat } from "./formatters.js";

const level = () =>
  process.env.NODE_ENV === "development"
    ? process.env.DEBUG_MODE
      ? "debug"
      : "http"
    : "info";

export const logger = winston.createLogger({
  levels: {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  level: process.env.DISABLE_LOGGING ? "silent" : level(),
  transports: [
    createConsoleTransport(process.env.DISABLE_LOGGING ? "silent" : level()),
  ],
  exitOnError: false,
  defaultMeta: { service: "backend-service" },
});

if (!process.env.DISABLE_FILE_LOGGING && !process.env.DISABLE_LOGGING) {
  logger.transports.push(
    ...[
      createFileTransport(LOG_PATHS.combined, "info"),
      createFileTransport(
        LOG_PATHS.error,
        "error",
        LOG_CONFIG.retentionPeriods.errors,
      ),
    ],
  );
}

const httpLogger = winston.createLogger({
  level: process.env.DISABLE_LOGGING ? "silent" : "http",
  format: createHttpFormat(),
  transports: [
    new winston.transports.Console({
      level: process.env.DISABLE_LOGGING ? "silent" : level(),
      format: winston.format.combine(
        winston.format.colorize(),
        createHttpFormat(),
      ),
    }),
  ],
});

if (!process.env.DISABLE_FILE_LOGGING && !process.env.DISABLE_LOGGING) {
  httpLogger.transports.push(createHTTPFileTransport(LOG_PATHS.http));
}

export const morganMiddleware = morgan(MORGAN_FORMAT, {
  stream: {
    write: (message) => httpLogger.http(message.trim()),
  },
});
