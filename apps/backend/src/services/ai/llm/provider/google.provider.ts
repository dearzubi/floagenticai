import { aisdk, AiSdkModel } from "@openai/agents-extensions";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ModelInitOptions, Models } from "./types.js";
import { z } from "zod/v4";
import { googleAICredentialsSchema } from "../../../credentials/credentials/googleai-credentials/schemas.js";

type GoogleGenAIChatModelId = Parameters<
  ReturnType<typeof createGoogleGenerativeAI>
>["0"];

const models = Object.freeze([
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
] satisfies Models<GoogleGenAIChatModelId>);

const DEFAULT_MODEL: GoogleGenAIChatModelId = "gemini-2.5-flash";

const initOptionsSchema = z.object({
  credential: z.union(
    [
      z
        .string({
          error: "Please provide your Google AI API key",
        })
        .nonempty(),
      googleAICredentialsSchema,
    ],
    {
      error: "Please provide your Google AI API key",
    },
  ),
});

/**
 * Initialise a Google Gen AI chat model to use with OpenAI Agent
 * @param options - Options for initializing the model, including API key and model name and other configurations.
 * @return AiSdkModel instance for the specified Anthropic model.
 */
const initChatModel = (
  options: ModelInitOptions<GoogleGenAIChatModelId>,
): AiSdkModel => {
  const parsedOptions = initOptionsSchema.parse(options);

  const google = createGoogleGenerativeAI({
    apiKey:
      typeof parsedOptions.credential === "string"
        ? parsedOptions.credential
        : parsedOptions.credential.data.api_key,
  });
  return aisdk(google(options.modelName ?? DEFAULT_MODEL));
};

export {
  models as googleGenAIModels,
  DEFAULT_MODEL as DEFAULT_GOOGLE_GEN_AI_MODEL,
  initChatModel as initGoogleChatModel,
};
