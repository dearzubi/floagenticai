import { z } from "zod/v4";

export const googleMapsCredentialsSchema = z.object({
  credentialName: z.literal("google_maps_credentials"),
  data: z.object({
    api_key: z
      .string({
        error: "Please provide your Google Maps API key",
      })
      .nonempty(),
  }),
});

export type GoogleMapsCredentials = z.infer<typeof googleMapsCredentialsSchema>;
