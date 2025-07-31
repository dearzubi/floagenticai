import { z } from "zod/v4";

export const evmPrivateKeyCredentialsSchema = z.object({
  name: z.literal("evm_pk_credentials"),
  data: z.object({
    private_key: z.string().nonempty(),
  }),
});
