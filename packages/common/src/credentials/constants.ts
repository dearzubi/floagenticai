import { ModelProviders } from "../ai/types.js";

const modelProvidersCredentialNames = [
  "openai",
  "google_gen_ai",
  "anthropic",
  "deepseek",
  "openrouter",
] satisfies ModelProviders[];

export const mcpServerCredentialNames = [
  "linkup_credentials",
  "perplexity_credentials",
  "everart_credentials",
] as const;

export const credentialNames = [
  ...modelProvidersCredentialNames,
  ...mcpServerCredentialNames,
  "evm_pk_credentials",
  "rpc_credentials",
  "oneinch_credentials",
] as const;
export const credentialPropertyTypes = [
  "options",
  "string",
  "password",
] as const;
