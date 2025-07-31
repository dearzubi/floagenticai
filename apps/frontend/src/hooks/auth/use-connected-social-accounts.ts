import { useMemo } from "react";
import { useUserStore } from "../../stores/user.store.ts";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  UserInfo,
} from "firebase/auth";

const supportedSocialProviders: string[] = [
  GoogleAuthProvider.PROVIDER_ID,
  GithubAuthProvider.PROVIDER_ID,
];

/**
 * A custom hook that retrieves the connected social accounts for the current user.
 *
 * @returns {UserInfo} - List of social accounts with provider information
 */
const useConnectedSocialAccounts = (): UserInfo[] => {
  const user = useUserStore((state) => state.user);

  return useMemo(() => {
    return (
      user?.providerData.filter((provider) => {
        return supportedSocialProviders.includes(provider.providerId);
      }) ?? []
    );
  }, [user]);
};

export default useConnectedSocialAccounts;
