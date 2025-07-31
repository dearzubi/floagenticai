import { useUserStore } from "../../stores/user.store.ts";
import { useState } from "react";
import { firebaseAuth } from "../../lib/firebase";
import {
  AuthErrorCodes,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { ChangePasswordHookReturn } from "./types.ts";
import useIsPasswordSet from "./use-is-password-set.ts";

/**
 * A custom hook for managing password change functionality.
 * Provides functionality to change or set a new password for a user account.
 * Handles both cases: updating the existing password and setting a new password for accounts without one.
 *
 * @returns {Object} An object containing the following:
 *   - `isPasswordSet`: Indicates if password is already set for the user account
 *   - `isPasswordChangeInProgress`: Indicates if password change operation is in progress
 *   - `currentPassword`: Current password input value
 *   - `setCurrentPassword`: Sets current password value
 *   - `newPassword`: New password input value
 *   - `setNewPassword`: Sets new password value
 *   - `confirmNewPassword`: Confirm new password input value
 *   - `setConfirmNewPassword`: Sets confirm new password value
 *   - `currentPasswordError`: Error message for current password
 *   - `newPasswordError`: Error message for new password
 *   - `confirmPasswordError`: Error message for confirm password
 *   - `changePasswordError`: General error message for password change
 *   - `changePassword`: Handles the password change operation
 *   - `resetErrorMessages`: Resets all error messages
 *   - `resetFields`: Resets all password input fields
 */

const useChangePassword = (): ChangePasswordHookReturn => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null,
  );

  const [isPasswordChangeInProgress, setIsPasswordChangeInProgress] =
    useState(false);

  const isPasswordSet = useIsPasswordSet();

  /**
   * Handles password change and manages related state.
   *
   * The function updates the following states during and after the password change process:
   * - `setCurrentPasswordError` to manage any errors encountered with the current password.
   * - `setNewPasswordError` to manage any errors encountered with the new password.
   * - `setConfirmPasswordError` to manage any errors encountered with password confirmation.
   * - `setIsPasswordChangeInProgress` to indicate the loading state.
   * - `setChangePasswordError` to manage any encountered error messages during password change.
   * - `setUser` to update the user state after successful password change.
   * - `setIsPasswordModalOpen` to control modal visibility.
   *
   * If the password change process fails, an appropriate error message is logged and managed as part of the state.
   */

  const changePassword = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    resetErrorMessages();

    if (!firebaseAuth.currentUser || !user) {
      return { success: false };
    }

    if (!currentPassword && isPasswordSet) {
      setCurrentPasswordError("Current password is required");
      return { success: false };
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      return { success: false };
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError("Confirm password do not match");
      return { success: false };
    }

    setIsPasswordChangeInProgress(true);

    try {
      if (isPasswordSet) {
        await reauthenticateWithCredential(
          firebaseAuth.currentUser,
          EmailAuthProvider.credential(user.email, currentPassword),
        );
        await updatePassword(firebaseAuth.currentUser, newPassword);
        setUser(firebaseAuth.currentUser);
        return {
          success: true,
          message: "Password changed successfully",
        };
      } else {
        await linkWithCredential(
          firebaseAuth.currentUser,
          EmailAuthProvider.credential(user.email, newPassword),
        );
        await sendEmailVerification(firebaseAuth.currentUser);
        setUser(firebaseAuth.currentUser);
        return {
          success: true,
          message:
            "Password set successfully. Please check your email to verify your account.",
        };
      }
    } catch (error) {
      console.error(error);
      const errorCode = (error as unknown as { code: string }).code;
      if (errorCode === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
        setCurrentPasswordError("Current password is incorrect");
      } else if (
        errorCode === AuthErrorCodes.WEAK_PASSWORD ||
        errorCode === "auth/password-does-not-meet-requirements"
      ) {
        setNewPasswordError(
          "Password must be at least 6 characters, including a number, an uppercase, and a lowercase letter",
        );
      } else {
        setChangePasswordError(
          "An error occurred while changing your password. Please try again or contact support.",
        );
      }
    } finally {
      setIsPasswordChangeInProgress(false);
    }
    return { success: false };
  };

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const resetErrorMessages = () => {
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
  };

  return {
    isPasswordSet,
    isPasswordChangeInProgress,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    currentPasswordError,
    newPasswordError,
    confirmPasswordError,
    changePasswordError,
    changePassword,
    resetErrorMessages,
    resetFields,
  };
};

export default useChangePassword;
