import { z } from "zod/v4";

export const openAICredentialsSchema = z.object({
  name: z.literal("open_ai_credentials"),
  data: z.object({
    api_key: z.string().nonempty(),
  }),
});
