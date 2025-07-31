import { z } from "zod/v4";

export const googleAICredentialsSchema = z.object({
  name: z.literal("google_ai_credentials"),
  data: z.object({
    api_key: z.string().nonempty(),
  }),
});
