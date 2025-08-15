import { ModelInitOptions } from "./types.js";
import { AiSdkModel } from "@openai/agents-extensions";
import { initAnthropicChatModel } from "./anthropic.provider.js";
import { initOpenAIChatModel } from "./openai.provider.js";
import { initGoogleChatModel } from "./google.provider.js";
import { ModelProviders } from "common";
import { initDeepSeekChatModel } from "./deepseek.provider.js";
import { initOpenRouterChatModel } from "./openrouter.provider.js";

export const chatModelFactories = new Map<
  ModelProviders,
  (options: ModelInitOptions) => AiSdkModel
>()
  .set("anthropic", initAnthropicChatModel)
  .set("openai", initOpenAIChatModel)
  .set("google_gen_ai", initGoogleChatModel)
  .set("deepseek", initDeepSeekChatModel)
  .set("openrouter", initOpenRouterChatModel);
