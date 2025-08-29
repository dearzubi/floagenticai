import { z } from "zod/v4";

export const braveCredentialsSchema = z.object({
  credentialName: z.literal("brave_credentials"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your Brave Search API key",
      })
      .nonempty(),
  }),
});

export type BraveCredentials = z.infer<typeof braveCredentialsSchema>;
