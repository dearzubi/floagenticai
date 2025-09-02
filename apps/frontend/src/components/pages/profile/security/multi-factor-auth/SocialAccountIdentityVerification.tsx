import { Button, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import { AuthErrorCodes, UserInfo } from "firebase/auth";
import { SocialAccountProviderIds } from "../../../../../types";
import useSocialAccountIdentityVerification from "../../../../../hooks/auth/use-social-account-identity-verification.ts";
import { useUserStore } from "../../../../../stores/user.store.ts";

const SocialAccountIdentityVerification: FC<{
  connectedSocialAccounts: UserInfo[];
  setStep: (step: "auth" | "setup" | "disable") => void;
}> = ({ connectedSocialAccounts, setStep }) => {
  const user = useUserStore((state) => state.user);
  const {
    socialAccountError,
    inProgressSocialAccountProvider,
    verifyAccountIdentity,
  } = useSocialAccountIdentityVerification();

  const handleSocialAccountVerification = async (
    providerId: SocialAccountProviderIds,
  ) => {
    const result = await verifyAccountIdentity(providerId);
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
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          connectedSocialAccounts.length === 2 && "grid-cols-2",
        )}
      >
        {connectedSocialAccounts.some(
          (account) => account.providerId === "google.com",
        ) && (
          <Button
            variant="flat"
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:border-white/30 text-foreground shadow-lg hover:shadow-gray-500/25 transition-all duration-300"
            startContent={<Icon icon="logos:google-icon" width={18} />}
            onPress={() => handleSocialAccountVerification("google.com")}
            isLoading={inProgressSocialAccountProvider === "google.com"}
            isDisabled={!!inProgressSocialAccountProvider}
          >
            Google
          </Button>
        )}
        {connectedSocialAccounts.some(
          (account) => account.providerId === "github.com",
        ) && (
          <Button
            variant="flat"
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-gray-500/25 transition-all duration-300"
            startContent={<Icon icon="lucide:github" width={18} />}
            onPress={() => handleSocialAccountVerification("github.com")}
            isLoading={inProgressSocialAccountProvider === "github.com"}
            isDisabled={!!inProgressSocialAccountProvider}
          >
            GitHub
          </Button>
        )}
      </div>
      <p className="text-xs text-danger-400">{socialAccountError}</p>
    </>
  );
};

export default SocialAccountIdentityVerification;
