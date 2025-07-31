import { useState } from "react";
import { firebaseAuth } from "../../lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { SendVerificationEmailHookReturn } from "./types.ts";

/**
 * A custom hook that provides functionality for send verification email to verify the email address of the user.
 *
 * @returns {SendVerificationEmailHookReturn} An object containing:
 * - `isSendingEmail`: A boolean indicating if an email is being sent.
 * - `errorMessage`: A string or null representing the error message if the process fails.
 * - `successMessage`: A string or null representing the error message if the process succeeds.
 * - `sendVerificationEmail`: A function to initiate the send verification email process.
 * - `resetMessages`: A function to reset the messages.
 */
const useSendVerificationEmail = (): SendVerificationEmailHookReturn => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Handles sending verification email and manages related state.
   *
   * The function updates the following states during and after the process:
   * - `setIsSendingEmail` to indicate the loading state.
   * - `setErrorMessage` to manage any encountered error messages.
   * - `setSuccessMessage` to reflect a success message.
   *
   * If the process fails, an appropriate error message is logged and managed as part of the state.
   */
  const sendVerificationEmail = async (): Promise<boolean> => {
    if (!firebaseAuth.currentUser) {
      setErrorMessage(
        "Please sign in first and try again to resend verification email",
      );
      return false;
    }
    resetMessages();
    setIsSendingEmail(true);

    try {
      await sendEmailVerification(firebaseAuth.currentUser);
      setSuccessMessage(
        "Verification email has been sent. Please check your email to verify your account.",
      );
      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "An unknown error occurred. Please try again later or contact support.",
      );
    } finally {
      setIsSendingEmail(false);
    }
    return false;
  };
  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return {
    isSendingEmail,
    errorMessage,
    successMessage,
    sendVerificationEmail,
    resetMessages,
  };
};

export default useSendVerificationEmail;
