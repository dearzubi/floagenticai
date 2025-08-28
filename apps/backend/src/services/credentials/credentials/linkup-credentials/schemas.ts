import { z } from "zod/v4";

export const linkupCredentialsSchema = z.object({
  credentialName: z.literal("linkup_credentials"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your Linkup API key",
      })
      .nonempty(),
  }),
});

export type LinkupCredentials = z.infer<typeof linkupCredentialsSchema>;
