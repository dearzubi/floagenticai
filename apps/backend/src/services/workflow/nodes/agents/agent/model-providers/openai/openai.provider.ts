import { ModelProvider } from "../types.js";

export const openaiProvider: ModelProvider = {
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
