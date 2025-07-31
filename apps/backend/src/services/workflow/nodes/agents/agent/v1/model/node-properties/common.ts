import { NodeProperty } from "common";

export const commonModelNodeProperties: NodeProperty[] = [
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
];
