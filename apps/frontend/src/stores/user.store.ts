import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  MultiFactorError,
  User as FBUser,
  UserInfo as ProviderInfo,
} from "firebase/auth";
import dayjs from "dayjs";

type ReloadUserInfo = {
  reloadUserInfo?: {
    passwordUpdatedAt?: number;
    mfaInfo?: Array<{ mfaEnrollmentId: string }>;
  };
};

export type User = {
  displayName: string;
  email: string;
  emailVerified: boolean;
  photoURL: string | null;
  uid: string;
  phoneNumber: string | null;
  providerData: ProviderInfo[];
  lastLoginAt: number;
  passwordUpdatedAt?: number;
  mfaEnrollmentId?: string;
};

interface UserStore {
  user: User | null;
  mfaSignInError: MultiFactorError | null;
  setUser: (fbUser: (FBUser & ReloadUserInfo) | null) => void;
  setMFASignInError: (mfaSignInError: MultiFactorError | null) => void;
}

export const useUserStore = create<UserStore>()(
  immer((set) => ({
    user: null,
    mfaSignInError: null,
    setUser: (fbUser) =>
      set(() => {
        if (!fbUser) {
          return { user: null };
        }
        return {
          user: {
            displayName: fbUser?.displayName || "User",
            email: fbUser?.email || "",
            emailVerified: fbUser?.emailVerified || false,
            photoURL: fbUser?.photoURL || null,
            uid: fbUser?.uid || "",
            phoneNumber: fbUser?.phoneNumber || null,
            providerData: fbUser?.providerData || [],
            passwordUpdatedAt: fbUser?.reloadUserInfo?.passwordUpdatedAt,
            mfaEnrollmentId:
              Array.isArray(fbUser.reloadUserInfo?.mfaInfo) &&
              fbUser.reloadUserInfo?.mfaInfo.length > 0
                ? fbUser.reloadUserInfo?.mfaInfo[0].mfaEnrollmentId
                : undefined,
            lastLoginAt: dayjs(fbUser.metadata.lastSignInTime).unix(),
          } satisfies User,
        };
      }),
    setMFASignInError: (mfaSignInError) =>
      set(() => {
        return {
          mfaSignInError,
        };
      }),
  })),
);
