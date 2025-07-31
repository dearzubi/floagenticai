import { useState } from "react";
import {
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import { PasswordSignUpHookReturn } from "./types.ts";

/**
 * A custom hook that provides functionality for email-password sign-up.
 *
 * @returns {PasswordSignUpHookReturn} An object containing the state and functions to handle sign-in:
 * - `setFullName`: A function to update the full name.
 * - `setEmail`: A function to update the email address.
 * - `setPassword`: A function to update the password.
 * - `setConfirmPassword`: A function to update the confirm-password.
 * - `fullName`: The full name of the user set by `setFullName`.
 * - `email`: The email address of the user set by `setEmail`.
 * - `password`: The password of the user set by `setPassword`.
 * - `confirmPassword`: The confirm-password of the user set by `setConfirmPassword`.
 * - `isPasswordSigningUp`: A boolean indicating if a sign-up process is ongoing.
 * - `passwordSignUpError`: A string or null representing the error message if the sign-up process fails.
 * - `passwordSignUpSuccess`: A string or null representing the success message if the sign-up process succeeds.
 * - `errorFullName`: A string or null representing the error message if there is an issue with the full name.
 * - `errorEmail`: A string or null representing the error message if there is an issue with the email address.
 * - `errorPassword`: A string or null representing the error message if there is an issue with the password.
 * - `errorConfirmPassword`: A string or null representing the error message if there is an issue with the confirm-password.
 * - `passwordSignUp`: A function to initiate the sign-in process.
 * - `passwordSignUpWithCustomCredentials`: A function to initiate the sign-up process with custom credentials.
 * This can be used to sign up with a custom name, email and password rather than using the name/email/password credentials from the internal state
 * that were set/updated by `setFullName`, `setEmail` and `setPassword` functions.
 * - `resetMessages`: A function to reset the error and success messages.
 */
const usePasswordSignup = (): PasswordSignUpHookReturn => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorFullName, setErrorFullName] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<
    string | null
  >(null);
  const [passwordSignUpError, setPasswordSignUpError] = useState<string | null>(
    null,
  );
  const [passwordSignUpSuccess, setPasswordSignUpSuccess] = useState<
    string | null
  >(null);
  const [isPasswordSigningUp, setIsPasswordSigningUp] =
    useState<boolean>(false);

  /**
   * Handles password sign-up using custom credentials (fullname, email, password) and manages related state.
   *
   * @param {string} fullName - Full name of the user.
   * @param {string} email - Email address of the user.
   * @param {string} password - Password of the user.
   * @param {string} confirmPassword - Confirm password of the user.
   *
   * The function updates the following states during and after the sign-in process:
   * - `setIsPasswordSigningUp` to indicate the loading state.
   * - `setPasswordSignUpError` to manage any encountered error messages during sign-up.
   * - `setPasswordSignUpSuccess` to manage any success messages during sign-up.
   * - `setErrorFullName` to manage any errors encountered while validating the full name.
   * - `setErrorEmail` to manage any errors encountered while validating the email address.
   * - `setErrorPassword` to manage any errors encountered while validating the password.
   * - `setErrorConfirmPassword` to manage any errors encountered while validating the confirm-password.
   *
   * If the sign-up process fails, an appropriate error message is logged and managed as part of the state.
   * If sign-up succeeds. it resets the credential state.
   */
  const passwordSignUpWithCustomCredentials = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    resetMessages();

    if (!fullName) {
      setErrorFullName("Full name is required");
      return;
    }
    if (!email) {
      setErrorEmail("Email is required");
      return;
    }
    if (!password) {
      setErrorPassword("Password is required");
      return;
    }
    if (!confirmPassword) {
      setErrorConfirmPassword("Confirm password is required");
    }

    if (password !== confirmPassword) {
      setErrorConfirmPassword("Passwords do not match");
      return;
    }

    setIsPasswordSigningUp(true);

    try {
      const credentials = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      await updateProfile(credentials.user, {
        displayName: fullName.trim(),
      });
      await sendEmailVerification(credentials.user);
      setPasswordSignUpSuccess(
        "Your account has been created. Please check your email to verify your account.",
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      const errorCode = (error as unknown as { code: string }).code;
      if (errorCode === AuthErrorCodes.EMAIL_EXISTS) {
        setErrorEmail("Email is already in use");
      } else if (errorCode === AuthErrorCodes.INVALID_EMAIL) {
        setErrorEmail("Email is invalid");
      } else if (errorCode === AuthErrorCodes.WEAK_PASSWORD) {
        setErrorPassword(
          "Password must be at least 6 characters, including a number, an uppercase, and a lowercase letter",
        );
      } else if (errorCode === "auth/password-does-not-meet-requirements") {
        setErrorPassword(
          "Password must be at least 6 characters, including a number, an uppercase, and a lowercase letter",
        );
      } else {
        setPasswordSignUpError(
          "An unknown error occurred. Please try again later or contact support.",
        );
      }
    } finally {
      setIsPasswordSigningUp(false);
    }
  };

  /**
   * Handles password sign-up using credentials set by `setFullName`, `setEmail` and `setPassword` functions and manages related state.
   *
   * The function updates the following states during and after the sign-in process:
   * - `setIsPasswordSigningUp` to indicate the loading state.
   * - `setPasswordSignUpError` to manage any encountered error messages during sign-up.
   * - `setPasswordSignUpSuccess` to manage any success messages during sign-up.
   * - `setErrorFullName` to manage any errors encountered while validating the full name.
   * - `setErrorEmail` to manage any errors encountered while validating the email address.
   * - `setErrorPassword` to manage any errors encountered while validating the password.
   * - `setErrorConfirmPassword` to manage any errors encountered while validating the confirm-password.
   *
   * If the sign-up process fails, an appropriate error message is logged and managed as part of the state.
   * If sign-up succeeds. it resets the credential state.
   */
  const passwordSignUp = async () => {
    await passwordSignUpWithCustomCredentials(
      fullName,
      email,
      password,
      confirmPassword,
    );
  };

  const resetMessages = () => {
    setErrorFullName(null);
    setErrorEmail(null);
    setErrorPassword(null);
    setErrorConfirmPassword(null);
    setPasswordSignUpSuccess(null);
    setPasswordSignUpError(null);
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errorFullName,
    errorEmail,
    errorPassword,
    errorConfirmPassword,
    passwordSignUpError,
    passwordSignUpSuccess,
    isPasswordSigningUp,
    passwordSignUpWithCustomCredentials,
    passwordSignUp,
    resetMessages,
  };
};

export default usePasswordSignup;
