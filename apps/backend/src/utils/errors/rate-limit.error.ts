import { AppError } from "./app.error.js";
import { IServerError } from "common";

export class TooManyRequestsError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message = "Too many requests",
    retryAfter?: number,
    errorCode = "RATE_LIMIT_EXCEEDED",
  ) {
    super(message, 429, errorCode);
    this.name = "TooManyRequestsError";
    this.retryAfter = retryAfter;
  }

  override toJSON(options?: {
    removeStack?: boolean;
  }): IServerError & { retryAfter?: number } {
    return {
      ...super.toJSON(options),
      retryAfter: this.retryAfter,
    };
  }
}
