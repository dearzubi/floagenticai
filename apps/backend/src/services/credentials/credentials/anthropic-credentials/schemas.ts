import { z } from "zod/v4";

export const anthropicCredentialsSchema = z.object({
  name: z.literal("anthropic_credentials"),
  data: z.object({
    api_key: z.string().nonempty(),
  }),
});
