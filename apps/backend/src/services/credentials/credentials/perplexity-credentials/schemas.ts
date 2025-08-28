import { z } from "zod/v4";

export const perplexityCredentialsSchema = z.object({
  credentialName: z.literal("perplexity_credentials"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your Perplexity API key",
      })
      .nonempty(),
  }),
});

export type PerplexityCredentials = z.infer<typeof perplexityCredentialsSchema>;
