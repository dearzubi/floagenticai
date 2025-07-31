import { openaiProvider } from "./openai/openai.provider.js";
import { ModelProvider } from "./types.js";
import { googleGenAiProvider } from "./googleai/google-gen-ai.provider.js";

export const modelProviders: ModelProvider[] = [
  openaiProvider,
  googleGenAiProvider,
];
