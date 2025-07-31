import { FileRouteTypes } from "../../routeTree.gen.ts";
import { AuthProvider } from "firebase/auth";
import { SocialAccountProviderIds } from "../../types";

export type SignInFunctionOptions = {
  redirectTo: FileRouteTypes["to"];
};

export type SocialSignInHookReturn = {
  isSocialSigningIn: boolean;
  socialSignInError: string | null;
  socialSignInProviderId: string | null;
  socialSignIn: (
    provider: AuthProvider | SocialAccountProviderIds,
    options?: SignInFunctionOptions,
  ) => Promise<void>;
  resetErrorMessages: () => void;
};

export type PasswordSignInHookReturn = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  errorEmail: string | null;
  errorPassword: string | null;
  passwordSignInError: string | null;
  isPasswordSigningIn: boolean;
  isEmailVerified: boolean | null;
  passwordSignInWithCustomCredentials: (
    email: string,
    password: string,
    options?: SignInFunctionOptions,
  ) => Promise<void>;
  passwordSignIn: (options?: SignInFunctionOptions) => Promise<void>;
  resetErrorMessages: () => void;
  setIsEmailVerified: (isEmailVerified: boolean | null) => void;
};

export type PasswordSignUpHookReturn = {
  fullName: string;
  setFullName: (fullName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  errorFullName: string | null;
  errorEmail: string | null;
  errorPassword: string | null;
  errorConfirmPassword: string | null;
  passwordSignUpError: string | null;
  passwordSignUpSuccess: string | null;
  isPasswordSigningUp: boolean;
  passwordSignUpWithCustomCredentials: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    options?: SignInFunctionOptions,
  ) => Promise<void>;
  passwordSignUp: (options?: SignInFunctionOptions) => Promise<void>;
  resetMessages: () => void;
};

export type SendVerificationEmailHookReturn = {
  isSendingEmail: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  sendVerificationEmail: () => Promise<boolean>;
  resetMessages: () => void;
};

export type SendPasswordResetEmailHookReturn = {
  isSendingEmail: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  sendResetEmail: (email: string) => Promise<boolean>;
  resetMessages: () => void;
};

export type SocialAccount = {
  id: SocialAccountProviderIds;
  name: string;
  icon: string;
  connected: boolean;
  email?: string;
};

export type SocialAccountLinkingHookReturn = {
  inProgressSocialAccountLink: SocialAccountProviderIds | null;
  socialAccounts: SocialAccount[];
  linkSocialAccount: (providerId: SocialAccountProviderIds) => Promise<{
    success: boolean;
    message?: string;
  }>;
  unlinkSocialAccount: (providerId: SocialAccountProviderIds) => Promise<{
    success: boolean;
    message?: string;
  }>;
};

export type ChangePasswordHookReturn = {
  isPasswordSet: boolean;
  currentPassword: string;
  setCurrentPassword: (currentPassword: string) => void;
  newPassword: string;
  setNewPassword: (newPassword: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (confirmNewPassword: string) => void;
  currentPasswordError: string | null;
  newPasswordError: string | null;
  confirmPasswordError: string | null;
  changePasswordError: string | null;
  isPasswordChangeInProgress: boolean;
  changePassword: () => Promise<{
    success: boolean;
    message?: string;
  }>;
  resetErrorMessages: () => void;
  resetFields: () => void;
};

export type SocialAccountIdentityVerificationHookReturn = {
  inProgressSocialAccountProvider: SocialAccountProviderIds | null;
  socialAccountError: string | null;
  verifyAccountIdentity: (providerId: SocialAccountProviderIds) => Promise<{
    success: boolean;
    message?: string;
  }>;
};

export type PasswordAccountIdentityVerificationHookReturn = {
  password: string;
  setPassword: (password: string) => void;
  passwordError: string | null;
  isVerifyingPassword: boolean;
  verifyAccountIdentity: () => Promise<{
    success: boolean;
    message?: string;
  }>;
};

export type MultiFactorAuthHookReturn = {
  mfaError: string | null;
  verificationCodeError: string | null;
  isGeneratingMFAKey: boolean;
  isVerifyingCode: boolean;
  qrCode: string | null;
  mfaSecretKey: string | null;
  mfaCodeLength: number;
  verificationCode: string;
  setVerificationCode: (verificationCode: string) => void;
  generateMFASecretKey: () => Promise<void>;
  verifyMFASetupCode: () => Promise<boolean>;
  verifyMFASignInCode: (
    shouldNavigate?: boolean,
    options?: SignInFunctionOptions,
  ) => Promise<boolean>;
  resetErrorMessages: () => void;
  disableMFA: (mfaEnrollmentId: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
};
