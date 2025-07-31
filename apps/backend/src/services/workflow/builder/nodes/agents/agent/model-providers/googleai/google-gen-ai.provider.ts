import { ModelProvider } from "../types.js";

export const googleGenAiProvider: ModelProvider = {
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
    {
      name: "temperature",
      label: "Temperature",
      type: "positiveNumber",
      default: 0.6,
      optional: true,
      description:
        "The temperature of the model. Higher values make the model more creative and lower values make it more focused.",
      minNumber: 0,
      maxNumber: 2,
    },
    {
      name: "streaming",
      label: "Streaming",
      type: "boolean",
      default: true,
      optional: true,
      description:
        "Whether to stream the response or not. If true, the response will be streamed to the client.",
    },
    {
      name: "additional_parameters",
      label: "Additional Parameters",
      type: "propertyCollection",
      optional: true,
      collection: [
        {
          name: "max_tokens",
          label: "Max Tokens",
          type: "positiveNumber",
          optional: true,
          minNumber: 0,
        },
        {
          name: "top_probability",
          label: "Top Probability",
          type: "positiveNumber",
          optional: true,
          minNumber: 0,
          maxNumber: 1,
        },
        {
          name: "freq_penality",
          label: "Frequency Penality",
          type: "number",
          optional: true,
          minNumber: -2,
          maxNumber: 2,
        },
        {
          name: "presence_penality",
          label: "Presence Penality",
          type: "number",
          optional: true,
          minNumber: -2,
          maxNumber: 2,
        },
        {
          name: "timeout",
          label: "Timeout",
          type: "positiveNumber",
          optional: true,
          minNumber: 0,
          maxNumber: 60,
          hidden: true, //TODO: Handle timeout later
        },
        {
          name: "parallel_tool_calls",
          label: "Parallel Tool Calls",
          type: "boolean",
          optional: true,
          default: true,
          description: "Allows multiple tools to be called in parallel",
          hidden: true, //TODO: Handle parallel_tool_calls later
        },
      ],
    },
  ],
};
