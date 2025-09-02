import { FC, useEffect } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import useSocialSignin from "../../../hooks/auth/use-social-signin.ts";
import { SocialAccountProviderIds } from "../../../types";
import { FileRouteTypes } from "../../../routeTree.gen.ts";

const SocialSignIn: FC<{
  redirectTo: FileRouteTypes["to"];
  setErrorMessage: (errorMessage: string | null) => void;
}> = ({ redirectTo, setErrorMessage }) => {
  const {
    isSocialSigningIn,
    socialSignInError,
    socialSignIn,
    socialSignInProviderId,
  } = useSocialSignin();

  const handleSocialSignIn = async (providerId: SocialAccountProviderIds) => {
    setErrorMessage(null);
    await socialSignIn(providerId, {
      redirectTo,
    });
  };

  useEffect(() => {
    setErrorMessage(socialSignInError);
  }, [socialSignInError, setErrorMessage]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="flat"
        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/30 text-foreground shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none"
        startContent={<Icon icon="logos:google-icon" width={18} />}
        onPress={() => handleSocialSignIn("google.com")}
        isLoading={
          isSocialSigningIn &&
          socialSignInProviderId === GoogleAuthProvider.PROVIDER_ID
        }
        isDisabled={isSocialSigningIn}
      >
        Google
      </Button>
      <Button
        variant="flat"
        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-gray-500/25 transition-all duration-300  focus:outline-none"
        startContent={<Icon icon="lucide:github" width={18} />}
        onPress={() => handleSocialSignIn("github.com")}
        isLoading={
          isSocialSigningIn &&
          socialSignInProviderId === GithubAuthProvider.PROVIDER_ID
        }
        isDisabled={isSocialSigningIn}
      >
        GitHub
      </Button>
    </div>
  );
};

export default SocialSignIn;
