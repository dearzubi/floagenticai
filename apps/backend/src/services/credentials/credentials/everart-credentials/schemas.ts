import { z } from "zod/v4";

export const everartCredentialsSchema = z.object({
  credentialName: z.literal("everart_credentials"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your EverArt API key",
      })
      .nonempty(),
  }),
});

export type EverArtCredentials = z.infer<typeof everartCredentialsSchema>;
