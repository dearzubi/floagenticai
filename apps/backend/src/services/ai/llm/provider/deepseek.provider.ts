import { createDeepSeek } from "@ai-sdk/deepseek";
import { aisdk, AiSdkModel } from "@openai/agents-extensions";
import { ModelInitOptions, Models } from "./types.js";
import { z } from "zod/v4";
import { deepseekCredentialsSchema } from "../../../credentials/credentials/deepseek-credentials/schemas.js";

type DeepSeekChatModelId = Parameters<ReturnType<typeof createDeepSeek>>["0"];

const models = Object.freeze([
  {
    name: "deepseek-chat",
    label: "deepseek-chat",
  },
  {
    name: "deepseek-reasoner",
    label: "deepseek-reasoner",
  },
] satisfies Models<DeepSeekChatModelId>);

const DEFAULT_MODEL: DeepSeekChatModelId = "deepseek-chat";

const initOptionsSchema = z.object({
  credential: z.union(
    [
      z
        .string({
          error: "Please provide your DeepSeek API key",
        })
        .nonempty(),
      deepseekCredentialsSchema,
    ],
    {
      error: "Please provide your DeepSeek API key",
    },
  ),
});

/**
 * Initialise a DeepSeek chat model to use with OpenAI Agent
 * @param options - Options for initializing the model, including API key and model name and other configurations.
 * @return AiSdkModel instance for the specified Anthropic model.
 */
const initChatModel = (
  options: ModelInitOptions<DeepSeekChatModelId>,
): AiSdkModel => {
  const parsedOptions = initOptionsSchema.parse(options);

  const deepSeek = createDeepSeek({
    apiKey:
      typeof parsedOptions.credential === "string"
        ? parsedOptions.credential
        : parsedOptions.credential.data.api_key,
  });
  return aisdk(deepSeek(options.modelName ?? DEFAULT_MODEL));
};

export {
  models as deepSeekModels,
  DEFAULT_MODEL as DEFAULT_DEEPSEEK_MODEL,
  initChatModel as initDeepSeekChatModel,
};
