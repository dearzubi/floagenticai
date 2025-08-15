import { NodeCredentialNames } from "common";
import { ModelProviderProperties } from "./types.js";
import { z } from "zod/v4";
import {
  getCommonModelProperties,
  commonModelSettingsSchema,
} from "../common.model.properties.js";

const openrouterProviderProperties: ModelProviderProperties = {
  name: "openrouter",
  label: "OpenRouter",
  icon: "openrouter-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "OpenRouter Credentials",
      name: "openrouter" satisfies NodeCredentialNames,
    },
    {
      name: "model",
      label: "Model",
      type: "string",
      default: "",
    },
    ...getCommonModelProperties(),
  ],
};

const openrouterProviderPropertiesSchema = z.object({
  openrouter: commonModelSettingsSchema
    .extend({
      model: z
        .string({ error: "Please provide the name of OpenRouter model" })
        .nonempty({ error: "Please provide the name of OpenRouter model" })
        .transform((v) => v ?? ""),
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
});

export { openrouterProviderProperties, openrouterProviderPropertiesSchema };
