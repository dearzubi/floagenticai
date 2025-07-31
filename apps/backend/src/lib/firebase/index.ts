import { initializeApp, cert } from "firebase-admin/app";
import { firebaseConfig } from "./firebase.config.js";
import { getAuth } from "firebase-admin/auth";
import { logger } from "../../utils/logger/index.js";

export const firebaseApp = initializeApp({
  credential: cert(firebaseConfig),
});
export const firebaseAuth = getAuth(firebaseApp);

const NUM_ADJ_INTERVALS = 5;

/**
 * Enables multi-factor authentication for Firebase Authentication.
 *
 * This function configures the Firebase Authentication project to enable multi-factor authentication
 * (MFA) by updating the project configuration. It sets the MFA state to "ENABLED" and configures
 * Time-based One-Time Password (TOTP) as a provider for MFA, with the specified adjacent intervals.
 */
export const enableMultiFactorAuth = async (): Promise<void> => {
  try {
    const result = await firebaseAuth
      .projectConfigManager()
      .updateProjectConfig({
        multiFactorConfig: {
          state: "ENABLED",
          providerConfigs: [
            {
              state: "ENABLED",
              totpProviderConfig: {
                adjacentIntervals: NUM_ADJ_INTERVALS,
              },
            },
          ],
        },
      });
    logger.info(
      `Firebase Authentication Multifactor Auth: ${result.multiFactorConfig?.state}`,
    );
  } catch (error) {
    logger.error("Failed to enable Firebase Authentication Multifactor Auth", {
      error: error,
    });
  }
};
