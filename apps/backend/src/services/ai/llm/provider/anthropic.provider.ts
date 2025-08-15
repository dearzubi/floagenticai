import { createAnthropic } from "@ai-sdk/anthropic";
import { aisdk, AiSdkModel } from "@openai/agents-extensions";
import { ModelInitOptions, Models } from "./types.js";
import { z } from "zod/v4";
import { anthropicCredentialsSchema } from "../../../credentials/credentials/anthropic-credentials/schemas.js";

type AnthropicMessagesModelId = Parameters<
  ReturnType<typeof createAnthropic>
>["0"];

const models = Object.freeze([
  {
    name: "claude-opus-4-20250514",
    label: "Claude Opus 4",
  },
  {
    name: "claude-sonnet-4-20250514",
    label: "Claude Sonnet 4",
  },
  {
    name: "claude-3-7-sonnet-20250219",
    label: "Claude Sonnet 3.7",
  },
  {
    name: "claude-3-5-sonnet-20241022",
    label: "Claude Sonnet 3.5",
  },
  {
    name: "claude-3-5-haiku-20241022",
    label: "Claude Haiku 3.5",
  },
  {
    name: "claude-3-haiku-20240307",
    label: "Claude Haiku 3",
  },
] satisfies Models<AnthropicMessagesModelId>);

const DEFAULT_MODEL: AnthropicMessagesModelId = "claude-4-sonnet-20250514";

const initOptionsSchema = z.object({
  credential: z.union(
    [
      z
        .string({
          error: "Please provide your Anthropic API key",
        })
        .nonempty(),
      anthropicCredentialsSchema,
    ],
    {
      error: "Please provide your Anthropic API key",
    },
  ),
});

/**
 * Initialise an Anthropic chat model to use with OpenAI Agent
 * @param options - Options for initializing the model, including API key and model name and other configurations.
 * @return AiSdkModel instance for the specified Anthropic model.
 */
const initChatModel = (
  options: ModelInitOptions<AnthropicMessagesModelId>,
): AiSdkModel => {
  const parsedOptions = initOptionsSchema.parse(options);

  const anthropic = createAnthropic({
    apiKey:
      typeof parsedOptions.credential === "string"
        ? parsedOptions.credential
        : parsedOptions.credential.data.api_key,
  });
  return aisdk(anthropic(options.modelName ?? DEFAULT_MODEL));
};

export {
  models as anthropicModels,
  DEFAULT_MODEL as DEFAULT_ANTHROPIC_MODEL,
  initChatModel as initAnthropicChatModel,
};
