import { AppError } from "./app.error.js";

export class AuthenticationError extends AppError {
  constructor(
    message = "Authentication failed",
    errorCode = "AUTH_FAILED",
    isOperational = true,
    cause?: Error,
  ) {
    super(message, errorCode, isOperational, 401, cause);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = "Access denied",
    errorCode = "ACCESS_DENIED",
    isOperational = true,
    cause?: Error,
  ) {
    super(message, errorCode, isOperational, 403, cause);
    this.name = "AuthorizationError";
  }
}
