import { z } from "zod/v4";

export const tokensListSchema = z.object({
  tokens: z.array(
    z.object({
      address: z.string(),
      chainId: z.number(),
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      logoURI: z.string().optional(),
    }),
  ),
});

export type TokensList = z.infer<typeof tokensListSchema>["tokens"];
