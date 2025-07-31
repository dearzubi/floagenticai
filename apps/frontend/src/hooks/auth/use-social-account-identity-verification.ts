import { useUserStore } from "../../stores/user.store.ts";
import { useState } from "react";
import { SocialAccountProviderIds } from "../../types";
import { firebaseAuth } from "../../lib/firebase";
import {
  AuthErrorCodes,
  GithubAuthProvider,
  GoogleAuthProvider,
  MultiFactorError,
  reauthenticateWithPopup,
  UserCredential,
} from "firebase/auth";
import { SocialAccountIdentityVerificationHookReturn } from "./types.ts";

/**
 * A custom hook that provides functionality for social account identity verification.
 * It is useful in case of a sensitive action that requires account reauthentication if the last sign was too long ago.
 *
 * @returns {SocialAccountIdentityVerificationHookReturn} An object containing the state and functions to handle verification:
 * - `socialAccountError`: A string or null representing the error message if the verification process fails.
 * - `inProgressSocialAccountVerification`: The provider ID of the current social provider in process or null.
 * - `verifyAccountIdentity`: A function to initiate the verification process with a specific provider.
 */

const useSocialAccountIdentityVerification =
  (): SocialAccountIdentityVerificationHookReturn => {
    const setUser = useUserStore((state) => state.setUser);
    const setMFASignInError = useUserStore((state) => state.setMFASignInError);
    const [socialAccountError, setSocialAccountError] = useState<string | null>(
      null,
    );
    const [
      inProgressSocialAccountProvider,
      setInProgressSocialAccountProvider,
    ] = useState<SocialAccountProviderIds | null>(null);

    /**
     * Handles social account identity verification using popup authentication and manages related state.
     *
     * @param {SocialAccountProviderIds} providerId - The ID of the social provider to verify against.
     * @returns {Promise<boolean>} Returns true if verification was successful, false otherwise.
     *
     * The function updates the following states during and after the verification process:
     * - `setInProgressSocialAccountVerification` to indicate which provider verification is in progress.
     * - `setSocialAccountError` to manage any encountered error messages during verification.
     * - `setUser` to update the user state after successful verification.
     *
     * If the verification process fails, an appropriate error message is logged and managed as part of the state.
     */

    const verifyAccountIdentity = async (
      providerId: SocialAccountProviderIds,
    ): Promise<{
      success: boolean;
      message?: string;
    }> => {
      if (!firebaseAuth.currentUser) {
        return { success: false };
      }
      setInProgressSocialAccountProvider(providerId);
      setSocialAccountError(null);

      try {
        let credentials: UserCredential | null = null;
        if (providerId === GoogleAuthProvider.PROVIDER_ID) {
          credentials = await reauthenticateWithPopup(
            firebaseAuth.currentUser,
            new GoogleAuthProvider(),
          );
        } else if (providerId === GithubAuthProvider.PROVIDER_ID) {
          credentials = await reauthenticateWithPopup(
            firebaseAuth.currentUser,
            new GithubAuthProvider(),
          );
        }
        if (credentials) {
          setUser(credentials.user);
          return { success: true };
        } else {
          setSocialAccountError(
            `An error occurred while verifying your ${providerId} account. Please try again or contact support.`,
          );
        }
      } catch (error) {
        console.error(error);
        const errorCode = (error as { code: string }).code;
        if (errorCode === AuthErrorCodes.MFA_REQUIRED) {
          setMFASignInError(error as MultiFactorError);
          return { success: false, message: errorCode };
        } else if (errorCode !== AuthErrorCodes.POPUP_CLOSED_BY_USER) {
          setSocialAccountError(
            `An error occurred while verifying your ${providerId} account. Please try again or contact support.`,
          );
        }
      } finally {
        setInProgressSocialAccountProvider(null);
      }
      return { success: false };
    };

    return {
      socialAccountError,
      inProgressSocialAccountProvider,
      verifyAccountIdentity,
    };
  };

export default useSocialAccountIdentityVerification;
