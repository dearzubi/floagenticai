import { useState } from "react";
import {
  AuthErrorCodes,
  MultiFactorError,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import { useNavigate } from "@tanstack/react-router";
import { PasswordSignInHookReturn, SignInFunctionOptions } from "./types.ts";
import { useUserStore } from "../../stores/user.store.ts";

/**
 * A custom hook that provides functionality for email-password sign-in.
 *
 * @returns {PasswordSignInHookReturn} An object containing the state and functions to handle sign-in:
 * - `setEmail`: A function to update the email address.
 * - `setPassword`: A function to update the password.
 * - `email`: The email address of the user set by `setEmail`.
 * - `password`: The password of the user set by `setPassword`.
 * - `isPasswordSigningIn`: A boolean indicating if a sign-in process is ongoing.
 * - `passwordSignInError`: A string or null representing the error message if the sign-in process fails.
 * - `errorEmail`: A string or null representing the error message if there is an issue with the email address.
 * - `errorPassword`: A string or null representing the error message if there is an issue with the password.
 * - `passwordSignIn`: A function to initiate the sign-in process.
 * - `passwordSignInWithCustomCredentials`: A function to initiate the sign-in process with custom credentials.
 * This can be used to sign in with a custom email and password rather than using the email/password credentials from the internal state
 * that were set/updated by `setEmail` and `setPassword` functions.
 * - `isEmailVerified`: A boolean indicating if the email address is verified. Status is retrieved after sign-in.
 * - `resetErrorMessages`: A function to reset the error messages.
 * - `setIsEmailVerified`: A function to update the email verification status.
 */
const usePasswordSignin = (): PasswordSignInHookReturn => {
  const setMFASignInError = useUserStore((state) => state.setMFASignInError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [passwordSignInError, setPasswordSignInError] = useState<string | null>(
    null,
  );
  const [isPasswordSigningIn, setIsPasswordSigningIn] =
    useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);

  const navigate = useNavigate();

  /**
   * Handles password sign-in using custom credentials (email,password) and manages related state.
   *
   * @param email - Email address of the user.
   * @param password - Password of the user.
   * @param {SignInFunctionOptions} options - List of optional parameters
   * - `redirectTo`: The page to redirect to after sign-in. Default: "/dashboard" page.
   *
   * The function updates the following states during and after the sign-in process:
   * - `setIsPasswordSigningIn` to indicate the loading state.
   * - `setPasswordSignInError` to manage any encountered error messages during sign-in.
   * - `setErrorEmail` to manage any errors encountered while validating the email address.
   * - `setErrorPassword` to manage any errors encountered while validating the password.
   * - `setIsEmailVerified` to reflect the current email verification status.
   *
   * If the sign-in process fails, an appropriate error message is logged and managed as part of the state.
   */
  const passwordSignInWithCustomCredentials = async (
    email: string,
    password: string,
    options: SignInFunctionOptions = {
      redirectTo: "/dashboard",
    },
  ) => {
    resetErrorMessages();
    if (!email) {
      setErrorEmail("Email is required");
      return;
    }
    if (!password) {
      setErrorPassword("Password is required");
      return;
    }
    setIsPasswordSigningIn(true);

    try {
      const credentials = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      if (!credentials.user.emailVerified) {
        setIsEmailVerified(false);
        setPasswordSignInError(
          "Account is not verified. Please check your email to verify your account.",
        );
      } else {
        await navigate({
          to: options.redirectTo,
        });
      }
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
      } else if (errorCode === AuthErrorCodes.INVALID_IDP_RESPONSE) {
        setPasswordSignInError(
          "Account does not exist or the password is incorrect",
        );
      } else {
        setPasswordSignInError(
          "An unknown error occurred. Please try again later or contact support.",
        );
      }
    } finally {
      setIsPasswordSigningIn(false);
    }
  };

  /**
   * Handles password sign-in using credentials set by `setEmail` and `setPassword` functions and manages related state.
   *
   * @param {SignInFunctionOptions} options - List of optional parameters
   * - `redirectTo`: The page to redirect to after sign-in. Default: "/dashboard" page.
   *
   * The function updates the following states during and after the sign-in process:
   * - `setIsPasswordSigningIn` to indicate the loading state.
   * - `setPasswordSignInError` to manage any encountered error messages during sign-in.
   * - `setErrorEmail` to manage any errors encountered while validating the email address.
   * - `setErrorPassword` to manage any errors encountered while validating the password.
   * - `setIsEmailVerified` to reflect the current email verification status.
   *
   * If the sign-in process fails, an appropriate error message is logged and managed as part of the state.
   */
  const passwordSignIn = async (
    options: SignInFunctionOptions = {
      redirectTo: "/dashboard",
    },
  ) => {
    await passwordSignInWithCustomCredentials(email, password, options);
  };

  const resetErrorMessages = () => {
    setErrorEmail(null);
    setErrorPassword(null);
    setPasswordSignInError(null);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errorEmail,
    errorPassword,
    passwordSignInError,
    isPasswordSigningIn,
    isEmailVerified,
    passwordSignInWithCustomCredentials,
    passwordSignIn,
    resetErrorMessages,
    setIsEmailVerified,
  };
};

export default usePasswordSignin;
