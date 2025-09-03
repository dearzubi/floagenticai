import cors from "cors";
import { logger } from "../logger/index.js";

/**
 * Creates and configures CORS middleware based on the current environment.
 *
 * In development: Allows all origins for easier local development
 * In production: Only allows specific domains defined in CORS_ALLOWED_ORIGINS environment variable
 *
 * @returns Configured CORS middleware
 */
export const createCorsMiddleware = (): ReturnType<typeof cors> => {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    return cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    });
  }

  const allowedOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0) || [];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
};
