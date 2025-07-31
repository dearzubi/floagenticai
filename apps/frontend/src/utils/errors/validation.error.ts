import { AppError, ISerialisedError } from "./app.error.js";

export class ValidationError extends AppError {
  public readonly fields?: unknown;

  constructor(
    message = "Validation failed",
    errorCode = "VALIDATION_ERROR",
    fields?: unknown,
  ) {
    super(message, errorCode);
    this.name = "ValidationError";
    this.fields = fields;
  }

  override toJSON(): ISerialisedError & { fields?: unknown } {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}
