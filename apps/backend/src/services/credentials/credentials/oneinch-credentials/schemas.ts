import { z } from "zod/v4";

export const oneInchAICredentialsSchema = z.object({
  name: z.literal("oneinch_credentials"),
  data: z.object({
    api_key: z.string().nonempty(),
  }),
});
