import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger/index.js";
import { getPostHogClient } from "../../../lib/posthog/index.js";
import { AppError } from "../../../utils/errors/app.error.js";
import { InternalServerError } from "../../../utils/errors/internal-server.error.js";

export const errorHandlerMiddleware = async (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else {
    appError = new InternalServerError(error as Error);
  }

  const serialisedError = {
    ...appError.toJSON(),
    request: {
      method: req.method,
      path: req.path,
    },
  };

  if (!appError.isOperational) {
    logger.error(appError.message, {
      error: serialisedError,
      cause: appError.cause,
    });

    const posthog = await getPostHogClient();

    if (posthog) {
      logger.info("Sending API error to PostHog");
      posthog.captureException(error, "server", serialisedError);
    }
  }
  // TODO: Do we need to log operational errors?

  res.status(appError.statusCode).json({
    ...appError.toJSON({
      removeStack: process.env.NODE_ENV === "production",
    }),
  });
};
