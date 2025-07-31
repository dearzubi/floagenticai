import { MikroORM } from "@mikro-orm/postgresql";
import { logger } from "../utils/logger/index.js";
import { InternalServerError } from "../utils/errors/internal-server.error.js";

let orm: Awaited<ReturnType<typeof MikroORM.init>>;

/**
 * Initializes the database by setting up the ORM and applying migrations if required.
 *
 * This function asynchronously initializes the Mikro ORM instance and stores it in the `orm` variable.
 * If the application is running in a production environment, it automatically applies pending database migrations.
 */
export const initDatabase = async (): Promise<void> => {
  orm = await MikroORM.init();
  logger.info("Database is initialised");
  if (process.env.NODE_ENV === "production") {
    await orm.getMigrator().up();
    logger.info("Database migrations applied");
  }
};

/**
 * Asynchronously retrieves the ORM instance. If the ORM has not been initialized,
 * it attempts to initialize the database before returning the ORM instance.
 *
 * @returns {Promise<typeof orm>} A promise resolving to the ORM instance.
 * @throws - Will throw an error if database initialization fails.
 */
export const getORM = async (): Promise<typeof orm> => {
  if (!orm) {
    await initDatabase().catch((error) => {
      logger.error(
        new InternalServerError(
          error as Error,
          "Database initialisation failed",
        ).toJSON(),
      );
    });
  }
  return orm;
};

export const shutdownDatabase = async (): Promise<void> => {
  if (!orm) {
    return;
  }

  try {
    await orm.close();

    logger.info("Database is shutdown.");
  } catch (error) {
    logger.error(
      new InternalServerError(
        error as Error,
        "Failed to shutdown database.",
      ).toJSON(),
    );
  }
};

export const getDB = async (): Promise<(typeof orm)["em"]> => {
  const orm = await getORM();
  return orm.em.fork();
};
