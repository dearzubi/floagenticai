import { IServerError } from "common";

export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // Distinguishes between expected errors and bugs
  public readonly errorCode: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true,
    cause?: Error,
  ) {
    super(message, { cause });

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Serialize error for API responses
   * */
  toJSON(options?: { removeStack?: boolean }): IServerError {
    const formatCause = (cause: unknown) => {
      if (cause instanceof AppError) {
        return cause.toJSON();
      }
      if (cause instanceof Error) {
        return {
          name: cause.name,
          message: cause.message,
          stack: !options?.removeStack ? cause.stack : undefined,
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
      ...(!options?.removeStack && { stack: this.stack }),
    };
  }
}
