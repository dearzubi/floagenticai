import { useUserStore } from "../../stores/user.store.ts";
import { useState } from "react";
import {
  AuthErrorCodes,
  getMultiFactorResolver,
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import { MultiFactorAuthHookReturn, SignInFunctionOptions } from "./types.ts";
import { useNavigate } from "@tanstack/react-router";

const MFA_APP_NAME = "FloAgenticAI";
const DEFAULT_MFA_CODE_LENGTH = 6;

/**
 * A custom hook that provides functionality for Multi-Factor Authentication (MFA) management.
 *
 * @returns {Object} An object containing the state and functions to handle MFA:
 * - `mfaError`: A string or null representing general MFA operation errors.
 * - `verificationCodeError`: A string or null representing verification code specific errors.
 * - `isGeneratingMFAKey`: A boolean indicating if secret key generation is in progress.
 * - `isVerifyingCode`: A boolean indicating if code verification is in progress.
 * - `qrCode`: The QR code URL for setting up TOTP in authenticator apps.
 * - `mfaSecretKey`: The generated MFA secret key for TOTP setup.
 * - `mfaCodeLength`: The required length of the verification code.
 * - `verificationCode`: The verification code input value.
 * - `setVerificationCode`: A function to update the verification code input.
 * - `generateMFASecretKey`: A function to generate a new MFA secret key.
 * - `verifyMFACode`: A function to verify the TOTP code.
 * - `resetErrorMessages`: A function to reset all error messages.
 */
const useMultiFactorAuth = (): MultiFactorAuthHookReturn => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const mfaSignInError = useUserStore((state) => state.mfaSignInError);
  const setMFASignInError = useUserStore((state) => state.setMFASignInError);

  const [mfaError, setMFAError] = useState<string | null>(null);
  const [isGeneratingMFAKey, setIsGeneratingMFAKey] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mfaSecretKey, setMFASecretKey] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState<
    string | null
  >(null);
  const [mfaCodeLength, setMfaCodeLength] = useState<number>(
    DEFAULT_MFA_CODE_LENGTH,
  );
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const navigate = useNavigate();
  /**
   * Handles generation of a new MFA secret key and manages related state.
   *
   * The function updates the following states during and after the generation process:
   * - `setIsGeneratingMFAKey` to indicate the loading state.
   * - `setMFAError` to manage any encountered error messages during generation.
   * - `setMFASecretKey` to store the newly generated secret key.
   * - `setMfaCodeLength` to store the required length of the verification code.
   * - `setQrCode` to store the generated QR code URL.
   *
   * If the generation process fails, an appropriate error message is logged and managed as part of the state.
   */
  const generateMFASecretKey = async () => {
    resetErrorMessages();
    if (!firebaseAuth.currentUser) {
      return;
    }

    setIsGeneratingMFAKey(true);

    try {
      const multiFactorSession = await multiFactor(
        firebaseAuth.currentUser,
      ).getSession();
      const totpSecret =
        await TotpMultiFactorGenerator.generateSecret(multiFactorSession);

      setTotpSecret(totpSecret);

      const totpUri = totpSecret.generateQrCodeUrl(
        firebaseAuth.currentUser.email!,
        MFA_APP_NAME,
      );

      setQrCode(totpUri);
      setMFASecretKey(totpSecret.secretKey);
      setMfaCodeLength(totpSecret.codeLength);
    } catch (error) {
      console.error(error);
      setMFAError(
        "An error occurred while setting Two-factor Authentication. Please try again or contact support.",
      );
    } finally {
      setIsGeneratingMFAKey(false);
    }
  };

  /**
   * Handles verification of MFA TOTP code.
   *
   * @returns {Promise<boolean>} Returns a boolean indicating if the verification was successful.
   *
   * The function updates the following states during and after the verification process:
   * - `setIsVerifyingCode` to indicate the verification progress
   * - `setVerificationCodeError` to store any validation/verification errors
   * - `setMFAError` to store any general MFA operation errors
   *
   * If the verification process fails, an appropriate error message is logged and managed as part of the state.
   */

  const verifyMFASetupCode = async (): Promise<boolean> => {
    resetErrorMessages();
    if (
      !verificationCode ||
      !user ||
      !firebaseAuth.currentUser ||
      !totpSecret
    ) {
      return false;
    }
    setIsVerifyingCode(true);

    try {
      const multiFactorAssertion =
        TotpMultiFactorGenerator.assertionForEnrollment(
          totpSecret,
          verificationCode,
        );
      await multiFactor(firebaseAuth.currentUser).enroll(
        multiFactorAssertion,
        MFA_APP_NAME,
      );
      setUser(firebaseAuth.currentUser);
      return true;
    } catch (error) {
      console.error(error);
      const errorCode = (error as { code: string }).code;
      if (errorCode === AuthErrorCodes.INVALID_CODE) {
        setVerificationCodeError(
          "Invalid verification code. Please try again.",
        );
      } else {
        setMFAError(
          "An error occurred while setting Two-factor Authentication. Please try again or contact support.",
        );
      }
    } finally {
      setIsVerifyingCode(false);
    }
    return false;
  };

  /**
   * Handles verification of MFA Sign In TOTP code. Upon successful verification, the user is redirected to the specified page.
   *
   * The function updates the following states during and after the verification process:
   * - `setIsVerifyingCode` to indicate the verification progress
   * - `setVerificationCodeError` to store any validation/verification errors
   * - `setMFAError` to store any general MFA operation errors
   *
   * If the verification process fails, an appropriate error message is logged and managed as part of the state.
   */

  const verifyMFASignInCode = async (
    shouldNavigate: boolean = true,
    options: SignInFunctionOptions = {
      redirectTo: "/dashboard",
    },
  ): Promise<boolean> => {
    resetErrorMessages();
    if (!verificationCode || !mfaSignInError) {
      return false;
    }
    setIsVerifyingCode(true);

    try {
      const mfaResolver = getMultiFactorResolver(firebaseAuth, mfaSignInError);

      const totp = mfaResolver.hints.find((info) => info.factorId === "totp");

      if (!totp) {
        throw new Error("No TOTP factor found.");
      }

      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
        totp?.uid,
        verificationCode,
      );

      const credentials = await mfaResolver.resolveSignIn(multiFactorAssertion);
      setUser(credentials.user);
      setMFASignInError(null);
      if (shouldNavigate) {
        await navigate({
          to: options.redirectTo,
        });
      }
      return true;
    } catch (error) {
      console.error(error);
      const errorCode = (error as { code: string }).code;
      if (errorCode === AuthErrorCodes.INVALID_CODE) {
        setVerificationCodeError(
          "Invalid verification code. Please try again.",
        );
      } else {
        setMFAError(
          "An error occurred while setting Two-factor Authentication. Please try again or contact support.",
        );
      }
    } finally {
      setIsVerifyingCode(false);
    }
    return false;
  };

  /**
   * Disables MFA for the current user.
   * @param mfaEnrollmentId - The enrollment ID of the MFA to disable.
   *
   * If the user access token is expired, the user is redirected to the sign-in page.
   * Otherwise, an error message is logged and managed as part of the state.
   */
  const disableMFA = async (
    mfaEnrollmentId: string,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!firebaseAuth.currentUser) {
      return {
        success: false,
      };
    }

    try {
      await multiFactor(firebaseAuth.currentUser).unenroll(mfaEnrollmentId);
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      const errorCode = (error as { code: string }).code;
      if (errorCode === AuthErrorCodes.TOKEN_EXPIRED) {
        await navigate({
          to: "/signin",
          search: {
            redirect: "/profile",
          },
        });
        return {
          success: false,
        };
      } else {
        return {
          success: false,
          message:
            "An error occurred while disabling Two-factor Authentication. Please try again or contact support.",
        };
      }
    }
  };

  const resetErrorMessages = () => {
    setMFAError(null);
    setVerificationCodeError(null);
  };

  return {
    mfaError,
    verificationCodeError,
    isGeneratingMFAKey,
    isVerifyingCode,
    qrCode,
    mfaSecretKey,
    mfaCodeLength,
    verificationCode,
    setVerificationCode,
    generateMFASecretKey,
    verifyMFASetupCode,
    resetErrorMessages,
    verifyMFASignInCode,
    disableMFA,
  };
};

export default useMultiFactorAuth;
