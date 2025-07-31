import { AppError } from "./app.error.js";

export class InternalServerError extends AppError {
  constructor(cause?: Error, message?: string) {
    super(
      message || "An unexpected server error occurred. Please try again later.",
      500,
      "INTERNAL_SERVER_ERROR",
      false,
      cause,
    );
    this.name = "InternalServerError";
  }
}
