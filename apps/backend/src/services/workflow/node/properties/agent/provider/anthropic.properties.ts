import { NodeCredentialNames, NodePropertyOption } from "common";
import { ModelProviderProperties } from "./types.js";
import { z } from "zod/v4";
import {
  anthropicModels,
  DEFAULT_ANTHROPIC_MODEL,
} from "../../../../../ai/llm/provider/anthropic.provider.js";
import {
  getCommonModelProperties,
  commonModelSettingsSchema,
} from "../common.model.properties.js";

const anthropicProviderProperties: ModelProviderProperties = {
  name: "anthropic",
  label: "Anthropic",
  icon: "anthropic-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "Anthropic Credentials",
      name: "anthropic" satisfies NodeCredentialNames,
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: anthropicModels.map((model) => {
        return {
          name: model.name,
          label: model.label,
        } satisfies NodePropertyOption;
      }),
      default: DEFAULT_ANTHROPIC_MODEL,
    },
    ...getCommonModelProperties(),
  ],
};

const anthropicProviderPropertiesSchema = z.object({
  anthropic: commonModelSettingsSchema
    .extend({
      model: z
        .enum(anthropicModels.map((model) => model.name) ?? [])
        .transform((v) => v ?? DEFAULT_ANTHROPIC_MODEL),
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
});

export { anthropicProviderProperties, anthropicProviderPropertiesSchema };
