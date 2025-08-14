import { z } from "zod/v4";

export const openAICredentialsSchema = z.object({
  credentialName: z.literal("openai"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your OpenAI API key",
      })
      .nonempty(),
  }),
});

export type OpenAICredentials = z.infer<typeof openAICredentialsSchema>;
