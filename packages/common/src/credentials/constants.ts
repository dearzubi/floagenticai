import { ModelProviders } from "../ai/types.js";

const modelProvidersCredentialNames = [
  "openai",
  "google_gen_ai",
  "anthropic",
] satisfies ModelProviders[];

export const credentialNames = [
  ...modelProvidersCredentialNames,
  "evm_pk_credentials",
  "rpc_credentials",
  "oneinch_credentials",
] as const;
export const credentialPropertyTypes = [
  "options",
  "string",
  "password",
] as const;
