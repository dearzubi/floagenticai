import { z } from "zod/v4";
import { modelProviders } from "../model-providers/index.js";
import { ModelProvider } from "../model-providers/types.js";
import { openAICredentialsSchema } from "../../../../../credentials/credentials/openai-credentials/schemas.js";
import { googleAICredentialsSchema } from "../../../../../credentials/credentials/googleai-credentials/schemas.js";
import { AgentArtifacts } from "common";

const openAIProvider = modelProviders.find(
  (provider) => provider.name === "openai",
) as ModelProvider;

const googleGenAiProvider = modelProviders.find(
  (provider) => provider.name === "google_gen_ai",
) as ModelProvider;

export const commonModelSettingsSchema = z.object({
  temperature: z
    .number()
    .min(0)
    .max(2)
    .nullish()
    .transform((v) => v ?? 0.6),
  streaming: z.boolean().default(true).nullish(),
  additional_parameters: z
    .object({
      max_tokens: z
        .number()
        .positive()
        .nullish()
        .transform((v) => (v === null ? undefined : v)),
      top_probability: z
        .number()
        .min(0)
        .max(1)
        .nullish()
        .transform((v) => (v === null ? undefined : v)),
      freq_penality: z
        .number()
        .min(-2)
        .max(2)
        .nullish()
        .transform((v) => (v === null ? undefined : v)),
      presence_penality: z
        .number()
        .min(-2)
        .max(2)
        .nullish()
        .transform((v) => (v === null ? undefined : v)),
      timeout: z
        .number()
        .min(0)
        .max(60)
        .nullish()
        .transform((v) => (v === null ? undefined : v)),
      parallel_tool_calls: z
        .boolean()
        .default(true)
        .nullish()
        .transform((v) => (v === null ? undefined : v)),
    })
    .nullish(),
});

export const inputSchema = z.object({
  enable_memory: z.boolean().nullish().default(true),
  instructions: z.string().nullish().default(""),
  input_message: z.string().nullish().default("Hello, how are you doing?"),
  model_provider: z.enum(modelProviders.map((provider) => provider.name)),
  openai_model_settings: commonModelSettingsSchema
    .extend({
      model: z
        .enum(
          openAIProvider.modelSettings
            .find((prop) => prop.name === "model")
            ?.options?.map((model) => model.name) ?? ["gpt-4.1-mini"],
        )
        .transform((v) => v ?? "gpt-4.1-mini"),
    })
    .nullish(),
  google_gen_ai_model_settings: commonModelSettingsSchema
    .extend({
      model: z
        .enum(
          googleGenAiProvider.modelSettings
            .find((prop) => prop.name === "model")
            ?.options?.map((model) => model.name) ?? ["gemini-2.5-flash"],
        )
        .transform((v) => v ?? "gemini-2.5-flash"),
    })
    .nullish(),
  output_structure: z
    .record(z.string(), z.unknown())
    .nullish()
    .transform((v) => v ?? undefined),
});

export const outputSchema = z.object({
  finalOutput: z.string(),
});

export const credentialsSchema = z
  .array(z.union([openAICredentialsSchema, googleAICredentialsSchema]))
  .nonempty({ error: "Missing model credentials." });

export type OutputsShape = z.infer<typeof outputSchema> & {
  structuredOutput?: Record<string, unknown>;
  artifacts?: AgentArtifacts;
};

export type CommonModelSettings = Partial<
  z.infer<typeof commonModelSettingsSchema>
>;
