import { z } from "zod/v4";

export const openrouterCredentialsSchema = z.object({
  credentialName: z.literal("openrouter"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your OpenRouter API key",
      })
      .nonempty(),
  }),
});

export type OpenRouterCredentials = z.infer<typeof openrouterCredentialsSchema>;
