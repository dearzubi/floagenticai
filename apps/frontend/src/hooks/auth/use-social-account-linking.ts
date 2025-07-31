import { useState } from "react";
import { SocialAccountProviderIds } from "../../types";
import { SocialAccount, SocialAccountLinkingHookReturn } from "./types.ts";
import {
  AuthErrorCodes,
  GithubAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  unlink,
  UserCredential,
} from "firebase/auth";
import { useUserStore } from "../../stores/user.store.ts";
import { firebaseAuth } from "../../lib/firebase";
import useConnectedSocialAccounts from "./use-connected-social-accounts.ts";

/**
 * A custom hook for managing the linking and unlinking of social accounts
 * (such as Google and GitHub) to a user's profile. It provides functions
 * to link or unlink social accounts, updates the state of connected accounts,
 * and tracks the progress of account linking/unlinking operations.
 *
 * @returns {SocialAccountLinkingHookReturn} An object containing:
 * - `socialAccounts`: An array of supported social accounts with their connection status and metadata.
 * - `linkSocialAccount`: A function to link a social account by its provider ID.
 * - `unlinkSocialAccount`: A function to unlink a social account by its provider ID.
 * - `inProgressSocialAccountLink`: The provider ID of the social account that is currently being linked/unlinked, or null if no process is in progress.
 */
const useSocialAccountLinking = (): SocialAccountLinkingHookReturn => {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const [inProgressSocialAccountLink, setInProgressSocialAccountLink] =
    useState<SocialAccountProviderIds | null>(null);

  const connectedSocialAccounts = useConnectedSocialAccounts();

  const connectedGoogleProvider = connectedSocialAccounts.find(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID,
  );

  const connectedGitHubProvider = connectedSocialAccounts.find(
    (provider) => provider.providerId === GithubAuthProvider.PROVIDER_ID,
  );

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    {
      id: GoogleAuthProvider.PROVIDER_ID,
      name: "Google",
      icon: "logos:google-icon",
      connected: !!connectedGoogleProvider,
      email: connectedGoogleProvider?.email ?? undefined,
    },
    {
      id: GithubAuthProvider.PROVIDER_ID,
      name: "GitHub",
      icon: "logos:github-icon",
      connected: !!connectedGitHubProvider,
      email: connectedGitHubProvider?.email ?? undefined,
    },
  ]);

  /**
   * Updates the connection state and email information for a social account provider.
   *
   * @param {SocialAccountProviderIds} providerId - The identifier for the social account provider to update.
   * @param {boolean} isConnected - The new connection state for the provider.
   *
   * The function updates the following information in the social accounts state:
   * - Connection status for the specified provider
   * - Associated email address (cleared if disconnected, updated from user data if connected)
   */
  const updateSocialAccountState = (
    providerId: SocialAccountProviderIds,
    isConnected: boolean,
  ) => {
    setSocialAccounts((prev) => {
      return prev.map((account) => {
        if (account.id === providerId) {
          account.connected = isConnected;
          account.email = !isConnected
            ? undefined
            : (user?.providerData.find(
                (provider) => provider.providerId === providerId,
              )?.email ?? undefined);
        }
        return account;
      });
    });
  };

  /**
   * Handles linking a social account to the currently authenticated user and manages related state.
   *
   * @param {SocialAccountProviderIds} providerId - The identifier for the social account provider (e.g., Google, GitHub).
   *
   * The function updates the following states during and after the linking process:
   * - `setInProgressSocialAccountLink` to indicate the loading state
   * - `setUser` to update the user's provider data
   * - `updateSocialAccountState` to update social account connection state
   *
   * If the linking process fails, appropriate error messages are displayed through toast notifications:
   */

  const linkSocialAccount = async (
    providerId: SocialAccountProviderIds,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!firebaseAuth.currentUser) {
      return {
        success: false,
      };
    }
    setInProgressSocialAccountLink(providerId);
    try {
      let credentials: UserCredential | null = null;
      if (providerId === GoogleAuthProvider.PROVIDER_ID) {
        credentials = await linkWithPopup(
          firebaseAuth.currentUser,
          new GoogleAuthProvider(),
        );
      } else if (providerId === GithubAuthProvider.PROVIDER_ID) {
        credentials = await linkWithPopup(
          firebaseAuth.currentUser,
          new GithubAuthProvider(),
        );
      }
      if (credentials) {
        setUser(credentials.user);
        updateSocialAccountState(providerId, true);
        return {
          success: true,
          message: `Successfully linked your ${providerId} account.`,
        };
      } else {
        return {
          success: false,
          message: `Failed to link your ${providerId} account. Please try again or contact support.`,
        };
      }
    } catch (error) {
      const errorCode = (error as unknown as { code: string }).code;

      if (errorCode === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        return {
          success: false,
          message: `Your ${providerId} account is already linked to another account.`,
        };
      } else if (errorCode !== AuthErrorCodes.POPUP_CLOSED_BY_USER) {
        console.error(error);
        return {
          success: false,
          message: `An error occurred while linking your ${providerId} account. Please try again or contact support.`,
        };
      }
    } finally {
      setInProgressSocialAccountLink(null);
    }
    return {
      success: false,
    };
  };

  /**
   * Handles unlinking a social account from the currently authenticated user.
   *
   * @param {SocialAccountProviderIds} providerId - The identifier for the social account provider (e.g., Google, GitHub).
   *
   * The function updates the following states during and after the unlinking process:
   * - `setInProgressSocialAccountLink` to indicate the loading state
   * - Updates the user's provider data through `setUser`
   * - Updates social account connection state through `updateSocialAccountState`
   *
   * If the unlinking process fails, an appropriate error message is displayed to the user through toast notifications.
   */

  const unlinkSocialAccount = async (
    providerId: SocialAccountProviderIds,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!firebaseAuth.currentUser) {
      return {
        success: false,
      };
    }
    setInProgressSocialAccountLink(providerId);
    try {
      await unlink(firebaseAuth.currentUser, providerId);
      setUser({
        ...firebaseAuth.currentUser,
        providerData: firebaseAuth.currentUser.providerData.filter(
          (provider) => provider.providerId !== providerId,
        ),
      });
      updateSocialAccountState(providerId, false);
      return {
        success: true,
        message: `Successfully unlinked your ${providerId} account.`,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: `An error occurred while unlinking your ${providerId} account. Please try again or contact support.`,
      };
    } finally {
      setInProgressSocialAccountLink(null);
    }
  };

  return {
    socialAccounts,
    linkSocialAccount,
    unlinkSocialAccount,
    inProgressSocialAccountLink,
  };
};

export default useSocialAccountLinking;
