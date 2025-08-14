import { z } from "zod/v4";

export const evmPrivateKeyCredentialsSchema = z.object({
  credentialName: z.literal("evm_pk_credentials"),
  data: z.object(
    {
      private_key: z.string().nonempty(),
    },
    { error: "Please provide your EVM private key." },
  ),
});

export type EVMPrivateKeyCredentialsData = z.infer<
  typeof evmPrivateKeyCredentialsSchema
>;
