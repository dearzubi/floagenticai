import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

export type SocialAccountProviderIds =
  | (typeof GoogleAuthProvider)["PROVIDER_ID"]
  | (typeof GithubAuthProvider)["PROVIDER_ID"];
