import { AppError, ISerialisedError } from "./app.error.ts";

export class APIError extends AppError {
  private errorData?: unknown;
  override statusCode: number;

  constructor(
    message: string,
    errorCode: string,
    statusCode: number = 400,
    isOperational = true,
    errorData?: unknown,
    cause?: Error,
  ) {
    super(message, errorCode, isOperational, statusCode, cause);
    this.errorData = errorData;
    this.statusCode = statusCode;
    this.name = "APIError";
  }

  override toJSON(): ISerialisedError & { errorData?: unknown } {
    return {
      ...super.toJSON(),
      errorData: this.errorData,
    };
  }
}
