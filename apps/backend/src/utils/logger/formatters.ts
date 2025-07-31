import winston from "winston";
import { LOG_CONFIG } from "./constants.js";
import { stringifyCircularJSON } from "../misc.js";
import { AppError } from "../errors/app.error.js";
import { InternalServerError } from "../errors/internal-server.error.js";

export const createConsoleFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.timestamp({ format: LOG_CONFIG.timestampFormat }),
    winston.format.colorize({ all: true }),
    winston.format.printf(createLogPrinter()),
  );
};

export const createFileFormat = (isJson = false): winston.Logform.Format => {
  return isJson
    ? createJsonFormat()
    : winston.format.combine(
        winston.format.timestamp({ format: LOG_CONFIG.timestampFormat }),
        winston.format.errors({ stack: true }),
        winston.format.printf(createLogPrinter(true)),
      );
};

export const createHttpFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.timestamp({ format: LOG_CONFIG.timestampFormat }),
    winston.format.printf(({ timestamp, message }) => {
      return `[server]: ${timestamp} [HTTP]: ${message}`;
    }),
  );
};

const createJsonFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.timestamp({ format: LOG_CONFIG.timestampFormat }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );
};

const createLogPrinter = (uppercase = false) => {
  const func: Parameters<typeof winston.format.printf>[0] = ({
    timestamp,
    level,
    message,
    stack,
    ...metadata
  }) => {
    const levelText = uppercase ? level.toUpperCase() : level;

    let log = `[server]: ${timestamp} [${levelText}]: ${message}`;

    if (
      Object.keys(metadata).length > 0 &&
      !(
        Object.keys(metadata).length === 1 && Object.hasOwn(metadata, "service")
      )
    ) {
      const metaString = stringifyCircularJSON(
        metadata,
        (_key, value) => {
          let appError: AppError | undefined = undefined;

          if (value instanceof AppError) {
            appError = value;
          } else if (value instanceof Error) {
            appError = new InternalServerError(value);
          }

          if (appError) {
            return appError.toJSON();
          }

          if (typeof value === "bigint") {
            return value.toString();
          }

          return value;
        },
        2,
      );
      if (metaString !== "{}") {
        log += ` ${metaString}`;
      }
    }
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    return log;
  };

  return func;
};
