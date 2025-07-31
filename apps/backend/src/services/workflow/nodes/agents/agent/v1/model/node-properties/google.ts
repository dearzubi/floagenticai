import { commonModelNodeProperties } from "./common.js";
import { ModelProviderNodeProperties } from "./types.js";

export const googleGenAIProviderNodeProperties: ModelProviderNodeProperties = {
  name: "google_gen_ai",
  label: "Google Gemini",
  icon: "gemini-logo.svg",
  modelSettings: [
    {
      type: "credential",
      label: "GoogleAI Credentials",
      name: "google_ai_credentials",
    },
    {
      name: "model",
      label: "Model",
      type: "options",
      options: [
        {
          name: "gemini-2.5-flash",
          label: "gemini-2.5-flash",
        },
        {
          name: "gemini-2.5-flash-lite-preview-06-17",
          label: "gemini-2.5-flash-lite-preview-06-17",
        },
        {
          name: "gemini-2.5-pro",
          label: "gemini-2.5-pro",
        },
        {
          name: "gemini-2.0-flash",
          label: "gemini-2.0-flash",
        },
        {
          name: "gemini-2.0-flash-lite",
          label: "gemini-2.0-flash-lite",
        },
        {
          name: "gemini-1.5-flash",
          label: "gemini-1.5-flash",
        },
        {
          name: "gemini-1.5-flash-8b",
          label: "gemini-1.5-flash-8b",
        },
        {
          name: "gemini-1.5-pro",
          label: "gemini-1.5-pro",
        },
      ],
      default: "gemini-2.5-flash",
    },
    ...commonModelNodeProperties,
  ],
};
