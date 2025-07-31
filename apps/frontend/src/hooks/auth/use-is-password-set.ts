import { useMemo } from "react";
import { useUserStore } from "../../stores/user.store.ts";

/**
 * A custom hook that determines if a user has a password set for their account.
 *
 * If the user object is unavailable or no relevant provider entry is found, it returns false.
 *
 * @returns {boolean} - True if the user has a password set, otherwise false.
 */
const useIsPasswordSet = () => {
  const user = useUserStore((state) => state.user);

  return useMemo(() => {
    return (
      user?.providerData.some(
        (provider) => provider.providerId === "password",
      ) ?? false
    );
  }, [user]);
};

export default useIsPasswordSet;
