import express, { type Express, type Request, type Response } from "express";
import { logger, morganMiddleware } from "../utils/logger/index.js";
import { errorHandlerMiddleware } from "./v1/middlewares/error-handler.middleware.js";
import RouterV1 from "./v1/routes/index.js";
import { join } from "path";
import { getBackendDirectoryAbsolutePath } from "../utils/misc.js";
import { User } from "../database/entities/user.entity.js";
import { InternalServerError } from "../utils/errors/internal-server.error.js";
import { createServer } from "http";
import { createCorsMiddleware } from "../utils/cors/index.js";

const app: Express = express();
const httpServer = createServer(app);
const port = process.env["PORT"] || 3000;

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      validatedQuery: Record<string, unknown>;
    }
  }
}

/**
 * Sets up middlewares, routes, and initializes the API server using Express.js.
 */
export const initAPIServer = (): void => {
  app.use(createCorsMiddleware());
  app.use(morganMiddleware);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  const publicDirectoryPath = join(getBackendDirectoryAbsolutePath(), "public");

  app.use("/public/assets", express.static(publicDirectoryPath));

  app.use("/api/v1", RouterV1);

  // Must be the last middleware in the middleware stack
  app.use(errorHandlerMiddleware);

  httpServer.listen(port, () => {
    logger.info(`API server is running at port ${port}.`);
  });
};

export const shutdownAPIServer = async (): Promise<void> => {
  await new Promise((resolve) => {
    if (!httpServer) {
      resolve(true);
    }
    httpServer.close((error) => {
      if (error) {
        logger.error(
          new InternalServerError(
            error as Error,
            "Failed to properly close the API server.",
          ).toJSON(),
        );
      } else {
        logger.info("API server is closed.");
      }
      resolve(true);
    });
  });
};

export const getAPIServer = (): typeof httpServer => {
  if (!httpServer) {
    initAPIServer();
  }
  return httpServer;
};
