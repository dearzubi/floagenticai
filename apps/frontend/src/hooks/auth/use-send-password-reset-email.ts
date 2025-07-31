import { useState } from "react";
import { firebaseAuth } from "../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { SendPasswordResetEmailHookReturn } from "./types.ts";

/**
 * A custom hook that provides functionality for sending password-reset email.
 *
 * @returns {SendPasswordResetEmailHookReturn} An object containing:
 * - `isSendingEmail`: A boolean indicating if an email is being sent.
 * - `errorMessage`: A string or null representing the error message if the process fails.
 * - `successMessage`: A string or null representing the error message if the process succeeds.
 * - `sendResetEmail`: A function to initiate the send password-reset email process.
 * - `resetMessages`: A function to reset the messages.
 */
const useSendPasswordResetEmail = (): SendPasswordResetEmailHookReturn => {
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
  const sendResetEmail = async (email: string): Promise<boolean> => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return false;
    }

    resetMessages();
    setIsSendingEmail(true);

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSuccessMessage(
        "Password reset email has been sent. Please check your email to reset your password.",
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
    sendResetEmail,
    resetMessages,
  };
};

export default useSendPasswordResetEmail;
