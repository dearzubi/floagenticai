import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import PasswordInput from "../../../../ui/input/PasswordInput.tsx";
import usePasswordAccountIdentityVerification from "../../../../../hooks/auth/use-password-account-identity-verification.ts";
import { useUserStore } from "../../../../../stores/user.store.ts";
import { AuthErrorCodes } from "firebase/auth";
import { handleEnterKeyPressedInInputField } from "../../../../../utils/ui.ts";

const PasswordAccountIdentityVerification: FC<{
  setStep: (step: "auth" | "setup" | "disable") => void;
}> = ({ setStep }) => {
  const user = useUserStore((state) => state.user);

  const {
    password,
    setPassword,
    passwordError,
    isVerifyingPassword,
    verifyAccountIdentity,
  } = usePasswordAccountIdentityVerification();

  const handlePasswordVerification = async () => {
    const result = await verifyAccountIdentity();
    if (result.success) {
      setStep("setup");
    } else {
      if (
        result.message === AuthErrorCodes.MFA_REQUIRED &&
        user?.mfaEnrollmentId
      ) {
        setStep("disable");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PasswordInput
        className="flex-1"
        name="password"
        label="Password"
        variant="bordered"
        placeholder="Enter your password"
        startContent={
          <Icon icon="lucide:lock" className="text-default-400" width={16} />
        }
        isInvalid={!!passwordError}
        errorMessage={passwordError}
        isDisabled={isVerifyingPassword}
        value={password}
        onValueChange={setPassword}
        onKeyDown={(e) =>
          handleEnterKeyPressedInInputField(e, handlePasswordVerification)
        }
      />
      <Button
        className="focus:outline-none hover:border-transparent shrink-0"
        color="primary"
        variant="flat"
        onPress={handlePasswordVerification}
        isLoading={isVerifyingPassword}
        isDisabled={isVerifyingPassword}
      >
        Verify Password
      </Button>
    </div>
  );
};

export default PasswordAccountIdentityVerification;
