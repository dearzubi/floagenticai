import { aisdk, AiSdkModel } from "@openai/agents-extensions";
import { createOpenAI } from "@ai-sdk/openai";
import { ModelInitOptions, Models } from "./types.js";
import { z } from "zod/v4";
import { openAICredentialsSchema } from "../../../credentials/credentials/openai-credentials/schemas.js";

type OpenAIChatModelId = Parameters<ReturnType<typeof createOpenAI>>["0"];

const models = Object.freeze([
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
] satisfies Models<OpenAIChatModelId>);

const DEFAULT_MODEL: OpenAIChatModelId = "gpt-4o";

const initOptionsSchema = z.object({
  credential: z.union(
    [
      z
        .string({
          error: "Please provide your OpenAI API key",
        })
        .nonempty(),
      openAICredentialsSchema,
    ],
    { error: "Please provide your OpenAI API key" },
  ),
});

/**
 * Initialise a OpenAI chat model to use with OpenAI Agent
 * @param options - Options for initializing the model, including API key and model name and other configurations.
 * @return AiSdkModel instance for the specified Anthropic model.
 */
const initChatModel = (
  options: ModelInitOptions<OpenAIChatModelId>,
): AiSdkModel => {
  const parsedOptions = initOptionsSchema.parse(options);

  const google = createOpenAI({
    apiKey:
      typeof parsedOptions.credential === "string"
        ? parsedOptions.credential
        : parsedOptions.credential.data.api_key,
  });
  return aisdk(google(options.modelName ?? DEFAULT_MODEL));
};

export {
  models as openAIModels,
  DEFAULT_MODEL as DEFAULT_OPENAI_MODEL,
  initChatModel as initOpenAIChatModel,
};
