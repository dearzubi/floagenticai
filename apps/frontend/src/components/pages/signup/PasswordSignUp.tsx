import { FC, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import usePasswordSignup from "../../../hooks/auth/use-password-signup.ts";
import { handleEnterKeyPressedInInputField } from "../../../utils/ui.ts";
import PasswordInput from "../../ui/input/PasswordInput.tsx";

const PasswordSignUp: FC<{
  setErrorMessage: (errorMessage: string | null) => void;
  setSuccessMessage: (successMessage: string | null) => void;
}> = ({ setErrorMessage, setSuccessMessage }) => {
  const {
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
    passwordSignUp,
  } = usePasswordSignup();

  const handlePasswordSignUp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    await passwordSignUp();
  };

  useEffect(() => {
    setErrorMessage(passwordSignUpError);
  }, [passwordSignUpError, setErrorMessage]);

  useEffect(() => {
    setSuccessMessage(passwordSignUpSuccess);
  }, [passwordSignUpSuccess, setSuccessMessage]);

  return (
    <>
      <Input
        isRequired
        name="fullName"
        label="Full Name"
        placeholder="Enter your name"
        variant="bordered"
        startContent={<Icon icon="lucide:user" className="text-default-400" />}
        isDisabled={isPasswordSigningUp}
        isInvalid={!!errorFullName}
        errorMessage={errorFullName}
        value={fullName}
        onValueChange={(value) => setFullName(value)}
        onKeyDown={(e) =>
          handleEnterKeyPressedInInputField(e, handlePasswordSignUp)
        }
      />

      <Input
        isRequired
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        variant="bordered"
        startContent={<Icon icon="lucide:mail" className="text-default-400" />}
        isDisabled={isPasswordSigningUp}
        isInvalid={!!errorEmail}
        errorMessage={errorEmail}
        value={email}
        onValueChange={(value) => setEmail(value)}
        onKeyDown={(e) =>
          handleEnterKeyPressedInInputField(e, handlePasswordSignUp)
        }
      />

      <PasswordInput
        isRequired
        name="password"
        label="Password"
        placeholder="Enter your password"
        variant="bordered"
        startContent={<Icon icon="lucide:lock" className="text-default-400" />}
        isDisabled={isPasswordSigningUp}
        isInvalid={!!errorPassword}
        errorMessage={errorPassword}
        value={password}
        onValueChange={setPassword}
        onKeyDown={(e) =>
          handleEnterKeyPressedInInputField(e, handlePasswordSignUp)
        }
      />

      <PasswordInput
        isRequired
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        variant="bordered"
        startContent={<Icon icon="lucide:lock" className="text-default-400" />}
        isDisabled={isPasswordSigningUp}
        isInvalid={!!errorConfirmPassword}
        errorMessage={errorConfirmPassword}
        value={confirmPassword}
        onValueChange={setConfirmPassword}
        onKeyDown={(e) =>
          handleEnterKeyPressedInInputField(e, handlePasswordSignUp)
        }
      />

      <Button
        type="submit"
        className="w-full focus:outline-none hover:border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        size="lg"
        onPress={handlePasswordSignUp}
        isLoading={isPasswordSigningUp}
        isDisabled={isPasswordSigningUp}
      >
        {isPasswordSigningUp ? "Creating Account..." : "Create Account"}
      </Button>
    </>
  );
};

export default PasswordSignUp;
