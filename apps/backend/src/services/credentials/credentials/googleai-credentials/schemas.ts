import { z } from "zod/v4";

export const googleAICredentialsSchema = z.object({
  credentialName: z.literal("google_gen_ai"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your Google AI API key",
      })
      .nonempty(),
  }),
});

export type GoogleAICredentials = z.infer<typeof googleAICredentialsSchema>;
