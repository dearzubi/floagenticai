import { ModelProviderNodeProperties } from "./types.js";
import { googleGenAIProviderNodeProperties } from "./google.js";
import { openAIProviderNodeProperties } from "./openai.js";
import { anthropicProviderNodeProperties } from "./anthropic.js";

export const modelProviderNodeProperties: ModelProviderNodeProperties[] = [
  openAIProviderNodeProperties,
  googleGenAIProviderNodeProperties,
  anthropicProviderNodeProperties,
];
