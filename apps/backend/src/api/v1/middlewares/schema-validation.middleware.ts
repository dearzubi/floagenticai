import { NextFunction, Request, Response } from "express";
import { genericAPISchemaValidationErrorHandler } from "../../../utils/errors/validation.error.js";
import { APIRequestDataSchemas } from "../schemas/types.js";

export const schemaValidationMiddleware = async (
  schemas: APIRequestDataSchemas,
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Record<string, string>;
    }
    if (schemas.query) {
      req.validatedQuery = schemas.query.parse(req.query) as Record<
        string,
        unknown
      >;
    }
    next();
  } catch (error) {
    genericAPISchemaValidationErrorHandler(error, next);
  }
};
