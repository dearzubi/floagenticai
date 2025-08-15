import { z } from "zod/v4";

export const deepseekCredentialsSchema = z.object({
  credentialName: z.literal("deepseek"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your DeepSeek API key",
      })
      .nonempty(),
  }),
});

export type DeepSeekCredentials = z.infer<typeof deepseekCredentialsSchema>;
