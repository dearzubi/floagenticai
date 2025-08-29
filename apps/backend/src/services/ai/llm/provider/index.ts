import { ModelInitOptions } from "./types.js";
import { AiSdkModel } from "@openai/agents-extensions";
import { initAnthropicChatModel } from "./anthropic.provider.js";
import { initOpenAIChatModel } from "./openai.provider.js";
import { initGoogleChatModel } from "./google.provider.js";
import { ModelProviders, NodePropertyOption } from "common";
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

export const modelProviders: NodePropertyOption[] = [
  {
    name: "openai" satisfies ModelProviders,
    label: "OpenAI",
    icon: "openai-logo.svg",
  },
  {
    name: "google_gen_ai" satisfies ModelProviders,
    label: "Google Gemini",
    icon: "gemini-logo.svg",
  },
  {
    name: "anthropic" satisfies ModelProviders,
    label: "Anthropic",
    icon: "anthropic-logo.svg",
  },
  {
    name: "deepseek" satisfies ModelProviders,
    label: "DeepSeek",
    icon: "deepseek-logo.svg",
  },
  {
    name: "openrouter" satisfies ModelProviders,
    label: "OpenRouter",
    icon: "openrouter-logo.svg",
  },
];

export const modelProviderNames = Object.freeze([
  "openai",
  "google_gen_ai",
  "anthropic",
  "deepseek",
  "openrouter",
] as const satisfies ModelProviders[]);
