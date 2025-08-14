import { openAIProviderProperties } from "./openai.properties.js";
import { googleGenAIProviderProperties } from "./google.genai.properties.js";
import { anthropicProviderProperties } from "./anthropic.properties.js";
import { ModelProviderProperties } from "./types.js";
import { ModelProviders } from "common";

const getModelProviderProperties = (): ModelProviderProperties[] => {
  return structuredClone([
    openAIProviderProperties,
    googleGenAIProviderProperties,
    anthropicProviderProperties,
  ]);
};

const modelProviderNames = Object.freeze([
  "openai",
  "google_gen_ai",
  "anthropic",
] as const satisfies ModelProviders[]);

export { getModelProviderProperties, modelProviderNames };
