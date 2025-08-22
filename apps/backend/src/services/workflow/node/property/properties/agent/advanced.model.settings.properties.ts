import { NodeProperty } from "common";
import { z } from "zod/v4";

export const getAdvancedModelSettingsProperties = (): NodeProperty[] => {
  return [
    {
      name: "streaming",
      label: "Streaming",
      type: "boolean",
      default: false, //TODO: there is a bug where default true is not being respected, so set it to false to force user to manually turn it on. Will fix later.
      optional: true,
      description:
        "Whether to stream the response or not. If true, the response will be streamed to the client.",
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
      name: "maxTokens",
      label: "Max Tokens",
      type: "positiveNumber",
      optional: true,
      minNumber: 0,
    },
    {
      name: "topP",
      label: "Top Probability",
      type: "positiveNumber",
      optional: true,
      minNumber: 0,
      maxNumber: 1,
    },
    {
      name: "frequencyPenalty",
      label: "Frequency Penality",
      type: "number",
      optional: true,
      minNumber: -2,
      maxNumber: 2,
    },
    {
      name: "presencePenalty",
      label: "Presence Penality",
      type: "number",
      optional: true,
      minNumber: -2,
      maxNumber: 2,
    },
  ];
};
export const advancedModelSettingsSchema = z.object({
  streaming: z
    .boolean({
      error: "Streaming must be true or false",
    })
    .nullish()
    .transform((v) => (typeof v === "boolean" ? v : true)),
  temperature: z
    .number({
      error: "Temperature must be a number between 0 and 2",
    })
    .min(0)
    .max(2)
    .nullish()
    .transform((v) => (typeof v === "number" ? v : 0.6)),
  maxTokens: z
    .number({
      error: "Max tokens must be a positive number",
    })
    .positive()
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
  topP: z
    .number({
      error: "Top probability must be a number between 0 and 1",
    })
    .min(0)
    .max(1)
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
  frequencyPenalty: z
    .number({
      error: "Frequency penalty must be a number between -2 and 2",
    })
    .min(-2)
    .max(2)
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
  presencePenalty: z
    .number({
      error: "Presence penalty must be a number between -2 and 2",
    })
    .min(-2)
    .max(2)
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
});
