import { AppError } from "./app.error.js";
import { NextFunction } from "express";
import { z } from "zod/v4";
import { IValidationError } from "common";

export class ValidationError extends AppError {
  public readonly fields?: IValidationError["fields"];

  constructor(
    message = "Validation failed",
    fields?: IValidationError["fields"],
    errorCode = "VALIDATION_ERROR",
    isOperational = true,
    cause?: Error,
  ) {
    super(message, 400, errorCode, isOperational, cause);
    this.name = "ValidationError";
    this.fields = fields;
  }

  override toJSON(options?: { removeStack?: boolean }): IValidationError {
    return {
      ...super.toJSON(options),
      fields: this.fields,
    };
  }
}

export const genericAPISchemaValidationErrorHandler = (
  error: unknown,
  next: NextFunction,
): void => {
  if (error instanceof z.ZodError) {
    next(
      new ValidationError(
        "API data schema validation failed",
        {
          message: error.message,
          issues: error.issues,
        },
        "API_SCHEMA_VALIDATION_ERROR",
      ),
    );
  } else {
    next(error);
  }
};
