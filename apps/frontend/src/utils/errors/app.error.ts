export interface ISerialisedError {
  name: string;
  message: string;
  errorCode: string;
  timestamp: string;
  statusCode?: number;
  stack?: string;
}

/**
 * The AppError class is an abstract base class that extends the native Error object.
 * It is intended for defining application-specific error objects with additional metadata.
 * It also allows for error object serialization.
 *
 * This class should be subclassed to define specific types of errors relevant to the application.
 *
 * Properties:
 * - `statusCode`: An optional HTTP status code representing the error.
 * - `isOperational`: A boolean indicating whether the error is operational (expected) or not (bug).
 * - `errorCode`: A custom error code string providing additional context for the error.
 * - `timestamp`: An ISO 8601-formatted string indicating when the error was created.
 *
 * Constructor Parameters:
 * - `message`: A string describing the error.
 * - `errorCode`: A string representing a custom error code.
 * - `isOperational`: A boolean (default: true) indicating whether the error is operational.
 * - `statusCode`: An optional HTTP status code.
 * - `cause`: An optional Error object or other data representing the underlying error cause.
 *
 * Methods:
 * - `toJSON`: Returns a serializable representation of the error object, including its properties,
 *   structured causes (if available), and stack trace information when applicable.
 */
export abstract class AppError extends Error {
  public readonly statusCode?: number;
  public readonly isOperational: boolean; // Distinguishes between expected errors and bugs
  public readonly errorCode: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    errorCode: string,
    isOperational = true,
    statusCode?: number,
    cause?: Error,
  ) {
    super(message, { cause });

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON(): ISerialisedError {
    const formatCause = (cause: unknown) => {
      if (cause instanceof AppError) {
        return cause.toJSON();
      }
      if (cause instanceof Error) {
        return {
          name: cause.name,
          message: cause.message,
          stack: cause.stack,
        };
      }
      return { error: String(cause) };
    };

    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
      ...(this.cause ? { cause: formatCause(this.cause) } : {}),
      ...{ stack: this.stack },
    };
  }
}
