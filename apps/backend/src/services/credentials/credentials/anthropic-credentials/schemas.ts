import { z } from "zod/v4";

export const anthropicCredentialsSchema = z.object({
  credentialName: z.literal("anthropic"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your Anthropic API key",
      })
      .nonempty(),
  }),
});

export type AnthropicCredentials = z.infer<typeof anthropicCredentialsSchema>;
