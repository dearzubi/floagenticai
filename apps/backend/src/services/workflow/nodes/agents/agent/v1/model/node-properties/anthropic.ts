import { commonModelNodeProperties } from "./common.js";
import { ModelProviderNodeProperties } from "./types.js";

export const anthropicProviderNodeProperties: ModelProviderNodeProperties = {
  name: "anthropic",
  label: "Anthropic",
  icon: "anthropic-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "Anthropic Credentials",
      name: "anthropic_credentials",
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: [
        {
          name: "claude-opus-4-20250514",
          label: "Claude Opus 4",
        },
        {
          name: "claude-sonnet-4-20250514",
          label: "Claude Sonnet 4",
        },
        {
          name: "claude-3-7-sonnet-20250219",
          label: "Claude Sonnet 3.7",
        },
        {
          name: "claude-3-5-sonnet-20241022",
          label: "Claude Sonnet 3.5",
        },
        {
          name: "claude-3-5-haiku-20241022",
          label: "Claude Haiku 3.5",
        },
        {
          name: "claude-3-haiku-20240307",
          label: "Claude Haiku 3",
        },
      ],
      default: "claude-sonnet-4-20250514",
    },
    ...commonModelNodeProperties,
  ],
};
