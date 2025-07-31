import { AppError } from "./app.error.ts";

export class NetworkError extends AppError {
  constructor(
    message: string,
    errorCode: string = "NETWORK_CONNECTION_FAILED",
    statusCode?: number,
    cause?: Error,
  ) {
    super(message, errorCode, false, statusCode, cause);
    this.name = "NetworkError";
  }
}
