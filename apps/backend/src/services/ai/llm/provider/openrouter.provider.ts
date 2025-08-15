import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { aisdk, AiSdkModel } from "@openai/agents-extensions";
import { ModelInitOptions } from "./types.js";
import { z } from "zod/v4";
import { openrouterCredentialsSchema } from "../../../credentials/credentials/openrouter-credentials/schemas.js";

const initOptionsSchema = z.object({
  credential: z.union(
    [
      z
        .string({
          error: "Please provide your OpenRouter API key",
        })
        .nonempty(),
      openrouterCredentialsSchema,
    ],
    {
      error: "Please provide your OpenRouter API key",
    },
  ),
});

/**
 * Initialise an OpenRouter chat model to use with OpenAI Agent
 * @param options - Options for initializing the model, including API key and model name and other configurations.
 * @return AiSdkModel instance for the specified Anthropic model.
 */
const initChatModel = (options: ModelInitOptions<string>): AiSdkModel => {
  const parsedOptions = initOptionsSchema.parse(options);

  const openRouter = createOpenRouter({
    apiKey:
      typeof parsedOptions.credential === "string"
        ? parsedOptions.credential
        : parsedOptions.credential.data.api_key,
  });

  if (!options.modelName) {
    throw new Error(
      "Model name is required to initialize the OpenRouter model.",
    );
  }

  return aisdk(openRouter(options.modelName));
};

export { initChatModel as initOpenRouterChatModel };
