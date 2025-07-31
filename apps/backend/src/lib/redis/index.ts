import { RedisClientType, createClient } from "redis";
import { logger } from "../../utils/logger/index.js";
import { InternalServerError } from "../../utils/errors/internal-server.error.js";

let client: RedisClientType;

export const initRedisClient = async (): Promise<void> => {
  client = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  });

  client.on("error", (err) => {
    logger.error(
      new InternalServerError(
        err as Error,
        "Failed to connect to Redis Client",
      ).toJSON(),
    );
  });
  await client.connect();
  logger.info("Connected to Redis Client");
};

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!client) {
    await initRedisClient();
  }
  return client;
};

export const shutdownRedisClient = async (): Promise<void> => {
  if (client) {
    client.destroy();
  }
  logger.info("Redis client is shutdown.");
};
