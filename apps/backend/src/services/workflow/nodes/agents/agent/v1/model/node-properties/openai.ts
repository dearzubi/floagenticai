import { ModelProviderNodeProperties } from "./types.js";
import { commonModelNodeProperties } from "./common.js";

export const openAIProviderNodeProperties: ModelProviderNodeProperties = {
  name: "openai",
  label: "OpenAI",
  icon: "openai-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "OpenAI Credentials",
      name: "open_ai_credentials",
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: [
        {
          name: "gpt-4.1",
          label: "gpt-4.1",
        },
        {
          name: "gpt-4.1-mini",
          label: "gpt-4.1-mini",
        },
        {
          name: "gpt-4.1-nano",
          label: "gpt-4.1-nano",
        },
        {
          name: "gpt-4o",
          label: "gpt-4o",
        },
        {
          name: "gpt-4o-mini",
          label: "gpt-4o-mini",
        },
        {
          name: "o4-mini",
          label: "o4-mini",
        },
        {
          name: "o3-mini",
          label: "o3-mini",
        },
        {
          name: "o1-preview",
          label: "o1-preview",
        },
        {
          name: "o1-mini",
          label: "o1-mini",
        },
        {
          name: "gpt-4",
          label: "gpt-4",
        },
        {
          name: "gpt-4-turbo",
          label: "gpt-4-turbo",
        },
        {
          name: "gpt-4-32k",
          label: "gpt-4-32k",
        },
        {
          name: "gpt-3.5-turbo",
          label: "gpt-3.5-turbo",
        },
      ],
      default: "gpt-4.1-mini",
    },
    ...commonModelNodeProperties,
  ],
};
