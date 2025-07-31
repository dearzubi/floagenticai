import { useUserStore } from "../../stores/user.store.ts";
import { useState } from "react";
import { firebaseAuth } from "../../lib/firebase";
import {
  AuthErrorCodes,
  EmailAuthProvider,
  MultiFactorError,
  reauthenticateWithCredential,
} from "firebase/auth";
import { PasswordAccountIdentityVerificationHookReturn } from "./types.ts";

/**
 * A custom hook that provides functionality for password account identity verification.
 * It is useful in case of a sensitive action that requires account reauthentication if the last sign was too long ago.
 *
 * @returns {PasswordAccountIdentityVerificationHookReturn} An object containing the state and functions to handle verification:
 * - `password`: The password input value.
 * - `setPassword`: Sets the password input value.
 * - `passwordError`: Error message for password.
 * - `isVerifyingPassword`: Indicates if password verification is in progress.
 * - `verifyAccountIdentity`: A function to initiate the verification process.
 */

const usePasswordAccountIdentityVerification =
  (): PasswordAccountIdentityVerificationHookReturn => {
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const setMFASignInError = useUserStore((state) => state.setMFASignInError);

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

    /**
     * Handles password account identity verification and manages related state.
     *
     * @returns {Promise<boolean>} Returns true if verification was successful, false otherwise.
     *
     * The function updates the following states during and after the verification process:
     * - `setIsVerifyingPassword` to indicate if the password verification is in progress.
     * - `setPasswordError` to manage any encountered error messages during verification.
     * - `setUser` to update the user state after successful verification.
     *
     * If the verification process fails, an appropriate error message is logged and managed as part of the state.
     */

    const verifyAccountIdentity = async (): Promise<{
      success: boolean;
      message?: string;
    }> => {
      if (!firebaseAuth.currentUser || !user) {
        return { success: false };
      }
      setPasswordError(null);
      setIsVerifyingPassword(true);

      try {
        const credentials = await reauthenticateWithCredential(
          firebaseAuth.currentUser,
          EmailAuthProvider.credential(user.email, password),
        );

        if (credentials) {
          setUser(credentials.user);
          return { success: true };
        } else {
          setPasswordError(
            `An error occurred while verifying your account. Please try again or contact support.`,
          );
        }
      } catch (error) {
        console.error(error);
        const errorCode = (error as { code: string }).code;
        if (errorCode === AuthErrorCodes.MFA_REQUIRED) {
          setMFASignInError(error as MultiFactorError);
          return { success: false, message: errorCode };
        } else if (errorCode === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
          setPasswordError(`Invalid password.`);
        } else {
          setPasswordError(
            `An error occurred while verifying your account. Please try again or contact support.`,
          );
        }
      } finally {
        setIsVerifyingPassword(false);
      }

      return { success: false };
    };

    return {
      password,
      setPassword,
      passwordError,
      isVerifyingPassword,
      verifyAccountIdentity,
    };
  };

export default usePasswordAccountIdentityVerification;
