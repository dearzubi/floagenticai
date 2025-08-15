import { NodeCredentialNames, NodePropertyOption } from "common";
import { ModelProviderProperties } from "./types.js";
import { z } from "zod/v4";
import {
  DEFAULT_OPENAI_MODEL,
  openAIModels,
} from "../../../../../ai/llm/provider/openai.provider.js";
import {
  commonModelSettingsSchema,
  getCommonModelProperties,
} from "../common.model.properties.js";

const openAIProviderProperties: ModelProviderProperties = {
  name: "openai",
  label: "OpenAI",
  icon: "openai-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "OpenAI Credentials",
      name: "openai" satisfies NodeCredentialNames,
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: openAIModels.map((model) => {
        return {
          name: model.name,
          label: model.label,
        } satisfies NodePropertyOption;
      }),
      default: DEFAULT_OPENAI_MODEL,
    },
    ...getCommonModelProperties(),
  ],
};

const openAIProviderPropertiesSchema = z.object({
  openai: commonModelSettingsSchema
    .extend({
      model: z
        .enum(openAIModels.map((model) => model.name) ?? [])
        .transform((v) => v ?? DEFAULT_OPENAI_MODEL),
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
});

export { openAIProviderProperties, openAIProviderPropertiesSchema };
