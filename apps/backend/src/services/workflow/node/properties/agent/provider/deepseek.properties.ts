import { NodeCredentialNames, NodePropertyOption } from "common";
import { ModelProviderProperties } from "./types.js";
import { z } from "zod/v4";
import {
  getCommonModelProperties,
  commonModelSettingsSchema,
} from "../common.model.properties.js";
import {
  deepSeekModels,
  DEFAULT_DEEPSEEK_MODEL,
} from "../../../../../ai/llm/provider/deepseek.provider.js";

const deepseekProviderProperties: ModelProviderProperties = {
  name: "deepseek",
  label: "DeepSeek",
  icon: "deepseek-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "DeepSeek Credentials",
      name: "deepseek" satisfies NodeCredentialNames,
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: deepSeekModels.map((model) => {
        return {
          name: model.name,
          label: model.label,
        } satisfies NodePropertyOption;
      }),
      default: DEFAULT_DEEPSEEK_MODEL,
    },
    ...getCommonModelProperties(),
  ],
};

const deepseekProviderPropertiesSchema = z.object({
  deepseek: commonModelSettingsSchema
    .extend({
      model: z
        .enum(deepSeekModels.map((model) => model.name) ?? [])
        .transform((v) => v ?? DEFAULT_DEEPSEEK_MODEL),
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
});

export { deepseekProviderProperties, deepseekProviderPropertiesSchema };
