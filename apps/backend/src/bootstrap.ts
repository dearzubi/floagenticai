// < ---- Following two lines must be at the top of the application bootstrap file ---->
import "dotenv/config";
import "./utils/env-schema.js";
// < ---- Above two lines must be at the top of the application bootstrap file ---->

import { shutdownDatabase, initDatabase } from "./database/init.js";
import { enableMultiFactorAuth } from "./lib/firebase/index.js";
import { shutdownAPIServer, initAPIServer } from "./api/init.js";
import { logger } from "./utils/logger/index.js";
import {
  initPostHogClient,
  shutdownPostHogClient,
} from "./lib/posthog/index.js";
import { initHatchetClient } from "./lib/hatchet/index.js";
import {
  shutdownHatchetWorkers,
  startHatchetWorkers,
} from "./services/workflow/execution-engine/worker.js";
import { initSocketIO, shutdownSocketIO } from "./api/v1/sockets/init.js";
import { initRedisClient, shutdownRedisClient } from "./lib/redis/index.js";

let isGracefulShutdownInProgress = false;
const DEFAULT_SHUTDOWN_TIMEOUT = 30_000;

/**
 * Initializes and configures the server by setting up necessary services and components.
 *
 * */
export const bootstrapServer = async (): Promise<void> => {
  logger.info("Starting server...");

  await initDatabase();
  await initRedisClient();

  await enableMultiFactorAuth();
  await initPostHogClient();

  initHatchetClient();

  initAPIServer();
  initSocketIO();

  // Hatchet workers must be initialized last as they might depend on all other services
  // and to prevent blocking the rest of the initialization
  await startHatchetWorkers();
};

/**
 * Handles the application's graceful shutdown process.
 *
 * This asynchronous function ensures a smooth and ordered termination of the application
 * upon receiving a specified shutdown signal. It performs the following steps:
 * - Prevents multiple shutdowns from being initiated simultaneously.
 * - Logs the received shutdown signal.
 * - Shuts down the necessary operational parts such as the PostHog client, API server, hatchet workers, and database connection.
 * - Waits for log completion before exiting.
 * -
 *
 * @param {string} signal - The signal triggering the shutdown, such as "SIGINT" or "SIGTERM".
 * @param {number} timeoutMs - The maximum time allowed for the shutdown process in milliseconds.
 */
const gracefulShutdown = async (
  signal: string,
  timeoutMs = DEFAULT_SHUTDOWN_TIMEOUT,
): Promise<number> => {
  if (isGracefulShutdownInProgress) {
    return 0;
  }

  isGracefulShutdownInProgress = true;
  logger.info(`Received "${signal}". Starting graceful shutdown...`);

  const shutdownSequence = (async () => {
    // 1. First shut down client-facing services to stop accepting new requests
    await shutdownSocketIO();
    await shutdownAPIServer();

    // 2. Then shut down workers to finish processing existing jobs
    await shutdownHatchetWorkers();

    // 3. Finally, shut down infrastructure services
    await shutdownRedisClient();
    await shutdownDatabase();
    await shutdownPostHogClient();

    await new Promise<void>((resolve) => {
      logger.on("finish", resolve);
      logger.end();
    });
    return 0;
  })();

  const timeoutPromise = new Promise<number>((resolve) => {
    setTimeout(() => {
      logger.warn(
        `Graceful shutdown exceeded ${timeoutMs}ms, forcing process exit`,
      );
      resolve(1);
    }, timeoutMs);
  });

  return Promise.race([shutdownSequence, timeoutPromise]);
};

process.on("SIGUSR2", async () => {
  const exitCode = await gracefulShutdown("SIGUSR2");
  process.exit(exitCode);
});

process.on("SIGTERM", async () => {
  const exitCode = await gracefulShutdown("SIGTERM");
  process.exit(exitCode);
});

process.on("SIGINT", async () => {
  const exitCode = await gracefulShutdown("SIGINT");
  process.exit(exitCode);
});

process.on("uncaughtException", async (error) => {
  logger.error("Uncaught Exception:", error);
  const exitCode = await gracefulShutdown("uncaught exception");
  process.exit(exitCode || 1);
});

process.on("unhandledRejection", async (reason) => {
  logger.error("Unhandled Rejection:", reason);
  const exitCode = await gracefulShutdown("unhandled rejection");
  process.exit(exitCode || 1);
});
