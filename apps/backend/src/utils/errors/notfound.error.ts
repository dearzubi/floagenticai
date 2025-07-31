import { AppError } from "./app.error.js";

export class NotFoundError extends AppError {
  constructor(message = "Not found", errorCode = "NOT_FOUND") {
    super(message, 404, errorCode);
    this.name = "NotFoundError";
  }
}
