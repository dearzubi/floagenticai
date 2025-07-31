import { PostHog } from "posthog-node";
import { logger } from "../../utils/logger/index.js";
import { InternalServerError } from "../../utils/errors/internal-server.error.js";

let posthogClient: PostHog;

/**
 * Initializes the PostHog client if the necessary environment variables are set.
 *
 * This function checks for the presence of the `POSTHOG_API_KEY` and `ENABLE_POSTHOG`
 * environment variables.
 *
 * The PostHog client is configured to flush data to the server when at least 10 events
 * are queued or every 5000 milliseconds (5 seconds), whichever occurs first.
 */
export const initPostHogClient = async (): Promise<void> => {
  if (!process.env.POSTHOG_API_KEY || !process.env.ENABLE_POSTHOG) {
    return;
  }
  posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
    host: "https://eu.i.posthog.com",
    flushAt: 10,
    flushInterval: 5000,
  });
  await posthogClient.enable();
  logger.info("PostHog client is initialised");
};

/**
 * Retrieves an instance of the PostHog client. If the client has not been initialized, it initializes the client
 * by setting it up before returning it.
 *
 * @returns {Promise<PostHog | undefined>} A promise resolving to the PostHog client instance or undefined if setup fails.
 */
export const getPostHogClient = async (): Promise<PostHog | undefined> => {
  if (!posthogClient) {
    await initPostHogClient();
  }
  return posthogClient;
};

/**
 * Shuts down the PostHog client if it has been initialised. This function ensures
 * the proper termination of the PostHog client, handling any unexpected errors
 * during the shutdown process.
 */
export const shutdownPostHogClient = async (): Promise<void> => {
  if (!posthogClient) {
    return;
  }

  try {
    await posthogClient.shutdown();
    logger.info("PostHog client is shutdown.");
  } catch (error) {
    logger.error(
      new InternalServerError(
        error as Error,
        "Failed to shutdown PostHog client",
      ).toJSON(),
    );
  }
};
