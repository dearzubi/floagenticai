import { NodeCredentialNames, NodePropertyOption } from "common";
import { ModelProviderProperties } from "./types.js";
import { z } from "zod/v4";
import {
  DEFAULT_GOOGLE_GEN_AI_MODEL,
  googleGenAIModels,
} from "../../../../../ai/llm/provider/google.provider.js";
import {
  commonModelSettingsSchema,
  getCommonModelProperties,
} from "../common.model.properties.js";

const googleGenAIProviderProperties: ModelProviderProperties = {
  name: "google_gen_ai",
  label: "Google Gemini",
  icon: "gemini-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "GoogleAI Credentials",
      name: "google_gen_ai" satisfies NodeCredentialNames,
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: googleGenAIModels.map((model) => {
        return {
          name: model.name,
          label: model.label,
        } satisfies NodePropertyOption;
      }),
      default: DEFAULT_GOOGLE_GEN_AI_MODEL,
    },
    ...getCommonModelProperties(),
  ],
};

const googleGenAIProviderPropertiesSchema = z.object({
  google_gen_ai: commonModelSettingsSchema
    .extend({
      model: z
        .enum(googleGenAIModels.map((model) => model.name) ?? [])
        .transform((v) => v ?? DEFAULT_GOOGLE_GEN_AI_MODEL),
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
});

export { googleGenAIProviderProperties, googleGenAIProviderPropertiesSchema };
