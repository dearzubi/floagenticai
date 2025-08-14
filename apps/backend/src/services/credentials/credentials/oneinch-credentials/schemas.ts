import { z } from "zod/v4";

export const oneInchAICredentialsSchema = z.object({
  credentialName: z.literal("oneinch_credentials"),
  data: z.object(
    {
      api_key: z.string().nonempty(),
    },
    { error: "Please provide your 1Inch API Key." },
  ),
});

export type OneInchAICredentialsData = z.infer<
  typeof oneInchAICredentialsSchema
>;
