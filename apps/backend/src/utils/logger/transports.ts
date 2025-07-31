import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { join } from "path";
import { LOG_CONFIG } from "./constants.js";
import {
  createConsoleFormat,
  createFileFormat,
  createHttpFormat,
} from "./formatters.js";
import { getBackendDirectoryAbsolutePath } from "../misc.js";

const logDirectory = join(getBackendDirectoryAbsolutePath(), "logs");

export const createFileTransport = (
  filename: string,
  level: string,
  maxFiles: string = LOG_CONFIG.retentionPeriods.default,
): DailyRotateFile => {
  return new DailyRotateFile({
    filename: join(logDirectory, filename),
    datePattern: LOG_CONFIG.datePattern,
    zippedArchive: true,
    maxSize: LOG_CONFIG.maxSize,
    maxFiles,
    level,
    format:
      process.env.NODE_ENV === "production"
        ? createFileFormat(true)
        : createFileFormat(),
    handleExceptions: true,
    handleRejections: true,
  });
};

export const createHTTPFileTransport = (
  filename: string,
  maxFiles: string = LOG_CONFIG.retentionPeriods.default,
): DailyRotateFile => {
  return new DailyRotateFile({
    filename: join(logDirectory, filename),
    datePattern: LOG_CONFIG.datePattern,
    zippedArchive: true,
    maxSize: LOG_CONFIG.maxSize,
    maxFiles,
    format: createHttpFormat(),
  });
};

export const createConsoleTransport = (
  level: string,
): typeof winston.transports.Console => {
  return new winston.transports.Console({
    level,
    format: createConsoleFormat(),
    handleExceptions: true,
    handleRejections: true,
  });
};
