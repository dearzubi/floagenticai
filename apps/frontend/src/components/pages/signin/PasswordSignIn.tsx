import { FC, useEffect } from "react";
import { Button, Input, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import PasswordInput from "../../ui/input/PasswordInput.tsx";
import { FileRouteTypes } from "../../../routeTree.gen.ts";
import usePasswordSignin from "../../../hooks/auth/use-password-signin.ts";
import useSendVerificationEmail from "../../../hooks/auth/use-send-verification-email.ts";
import { handleEnterKeyPressedInInputField } from "../../../utils/ui.ts";
import useSendPasswordResetEmail from "../../../hooks/auth/use-send-password-reset-email.ts";

const PasswordSignIn: FC<{
  redirectTo: FileRouteTypes["to"];
  setErrorMessage: (errorMessage: string | null) => void;
  setSuccessMessage: (successMessage: string | null) => void;
}> = ({ redirectTo, setErrorMessage, setSuccessMessage }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errorEmail,
    errorPassword,
    passwordSignInError,
    isPasswordSigningIn,
    isEmailVerified,
    passwordSignIn,
    resetErrorMessages: resetPasswordSignErrorMessages,
    setIsEmailVerified,
  } = usePasswordSignin();

  const {
    isSendingEmail,
    errorMessage: verificationEmailError,
    successMessage: verificationEmailSuccessMessage,
    sendVerificationEmail,
    resetMessages: resetVerificationEmailMessages,
  } = useSendVerificationEmail();

  const {
    isSendingEmail: isSendingPasswordResetEmail,
    errorMessage: passwordResetEmailError,
    successMessage: passwordResetEmailSuccessMessage,
    sendResetEmail: sendPasswordResetEmail,
    resetMessages: resetPasswordResetEmailMessages,
  } = useSendPasswordResetEmail();

  const handlePasswordSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    resetVerificationEmailMessages();
    resetPasswordResetEmailMessages();

    await passwordSignIn({
      redirectTo,
    });
  };

  const handleVerificationEmail = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    resetPasswordSignErrorMessages();
    resetPasswordResetEmailMessages();
    const result = await sendVerificationEmail();

    if (result) {
      setIsEmailVerified(null);
    }
  };

  const handleSwitchAccount = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEmailVerified(null);
  };

  useEffect(() => {
    if (passwordSignInError) {
      setErrorMessage(passwordSignInError);
    } else if (verificationEmailError) {
      setErrorMessage(verificationEmailError);
    } else if (passwordResetEmailError) {
      setErrorMessage(passwordResetEmailError);
    } else {
      setErrorMessage(null);
    }
  }, [
    passwordSignInError,
    verificationEmailError,
    passwordResetEmailError,
    setErrorMessage,
  ]);

  useEffect(() => {
    if (verificationEmailSuccessMessage) {
      setSuccessMessage(verificationEmailSuccessMessage);
    } else if (passwordResetEmailSuccessMessage) {
      setSuccessMessage(passwordResetEmailSuccessMessage);
    } else {
      setSuccessMessage(null);
    }
  }, [
    verificationEmailSuccessMessage,
    passwordResetEmailSuccessMessage,
    setSuccessMessage,
  ]);

  return (
    <>
      {isEmailVerified === null && (
        <>
          <Input
            isRequired
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            variant="bordered"
            startContent={
              <Icon icon="lucide:mail" className="text-default-400" />
            }
            isDisabled={isPasswordSigningIn}
            isInvalid={!!errorEmail}
            errorMessage={errorEmail}
            value={email}
            onValueChange={setEmail}
            onKeyDown={(e) =>
              handleEnterKeyPressedInInputField(e, handlePasswordSignIn)
            }
          />

          <PasswordInput
            isRequired
            name="password"
            label="Password"
            placeholder="Enter your password"
            variant="bordered"
            startContent={
              <Icon icon="lucide:lock" className="text-default-400" />
            }
            isDisabled={isPasswordSigningIn}
            isInvalid={!!errorPassword}
            errorMessage={errorPassword}
            value={password}
            onValueChange={setPassword}
            onKeyDown={(e) =>
              handleEnterKeyPressedInInputField(e, handlePasswordSignIn)
            }
          />

          <div className="flex items-center justify-between">
            <Link
              href="#"
              className="text-sm text-primary-500 hover:underline"
              onPress={() => sendPasswordResetEmail(email)}
              isDisabled={isSendingPasswordResetEmail}
            >
              {isSendingPasswordResetEmail
                ? "Sending password reset email..."
                : "Forgot password?"}
            </Link>
          </div>
          <Button
            type="submit"
            color="primary"
            className="w-full focus:outline-none hover:border-transparent"
            size="lg"
            onPress={handlePasswordSignIn}
            isLoading={isPasswordSigningIn}
            isDisabled={isPasswordSigningIn}
          >
            {isPasswordSigningIn ? "Signing in..." : "Sign In"}
          </Button>
        </>
      )}
      {isEmailVerified === false && (
        <>
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            variant="bordered"
            startContent={
              <Icon icon="lucide:mail" className="text-default-400" />
            }
            isDisabled={true}
            value={email}
          />
          <Button
            type="submit"
            color="primary"
            className="w-full focus:outline-none hover:border-transparent"
            size="lg"
            onPress={handleVerificationEmail}
            isLoading={isSendingEmail}
            isDisabled={isSendingEmail}
          >
            Resend verification email
          </Button>
          <Button
            type="submit"
            color="primary"
            className="w-full border-0"
            size="sm"
            variant={"bordered"}
            onPress={handleSwitchAccount}
          >
            Switch account
          </Button>
        </>
      )}
    </>
  );
};

export default PasswordSignIn;
