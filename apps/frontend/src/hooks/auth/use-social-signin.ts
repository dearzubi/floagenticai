import { useState } from "react";
import {
  AuthErrorCodes,
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  MultiFactorError,
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import { useNavigate } from "@tanstack/react-router";
import { SignInFunctionOptions, SocialSignInHookReturn } from "./types.ts";
import { SocialAccountProviderIds } from "../../types";
import { useUserStore } from "../../stores/user.store.ts";

/**
 * A custom hook that provides functionality for social sign-in using authentication providers.
 *
 * @returns {SocialSignInHookReturn} An object containing the state and functions to handle social sign-in:
 * - `isSocialSigningIn`: A boolean indicating if a social sign-in process is ongoing.
 * - `socialSignInError`: A string or null representing the error message if the sign-in process fails.
 * - `socialSignInProviderId`: A string or null that represents the ID of the provider currently being used for sign-in. e.g., google.com
 * - `socialSignIn`: A function to initiate the social sign-in process using the provided authentication provider and an optional options object.
 * - `resetErrorMessages`: A function to reset the error messages.
 */
const useSocialSignin = (): SocialSignInHookReturn => {
  const setMFASignInError = useUserStore((state) => state.setMFASignInError);

  const [isSocialSigningIn, setIsSocialSigningIn] = useState<boolean>(false);
  const [socialSignInError, setSocialSignInError] = useState<string | null>(
    null,
  );
  const [socialSignInProviderId, setSocialSignInProviderId] = useState<
    string | null
  >(null);
  const navigate = useNavigate();

  /**
   * Handles social sign-in using a specified authentication provider and manages related state.
   *
   * @param {AuthProvider} provider - The authentication provider used for signing in.
   * @param {SignInFunctionOptions} options - List of optional parameters
   * - `redirectTo`: The page to redirect to after sign-in. Default: "/dashboard" page.
   *
   * The function updates the following states during and after the sign-in process:
   * - `setIsSocialSigningIn` to indicate the loading state.
   * - `setSocialSignInError` to manage any encountered error messages.
   * - `setSocialSignInProviderId` to reflect the current provider in use.
   *
   * If the sign-in process fails, an appropriate error message is logged and managed as part of the state.
   * Errors caused by the user closing the popup are excluded.
   */
  const socialSignIn = async (
    provider: AuthProvider | SocialAccountProviderIds,
    options: SignInFunctionOptions = {
      redirectTo: "/dashboard",
    },
  ) => {
    resetErrorMessages();

    if (typeof provider === "string") {
      if (provider === "github.com") {
        provider = new GithubAuthProvider();
      } else if (provider === "google.com") {
        provider = new GoogleAuthProvider();
      }
    }

    setIsSocialSigningIn(true);
    setSocialSignInProviderId(provider.providerId);
    try {
      await signInWithPopup(firebaseAuth, provider);
      await navigate({
        to: options.redirectTo,
      });
    } catch (error) {
      console.error(error);
      const errorCode = (error as unknown as { code: string }).code;
      if (errorCode === AuthErrorCodes.MFA_REQUIRED) {
        setMFASignInError(error as MultiFactorError);

        await navigate({
          to: "/multi-factor-verification",
          search: {
            redirect: options.redirectTo,
          },
        });
      } else if (errorCode !== AuthErrorCodes.POPUP_CLOSED_BY_USER) {
        setSocialSignInError(
          `An error occurred while signing in with ${provider.providerId}. Please try again or contact support.`,
        );
      }
    } finally {
      setIsSocialSigningIn(false);
      setSocialSignInProviderId(null);
    }
  };

  const resetErrorMessages = () => {
    setSocialSignInError(null);
  };

  return {
    isSocialSigningIn,
    socialSignInError,
    socialSignIn,
    socialSignInProviderId,
    resetErrorMessages,
  };
};

export default useSocialSignin;
