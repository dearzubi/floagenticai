import { z } from "zod/v4";
import { RPCProviders } from "../../../blockchain/rpc/types.js";

export const providers = new Map<RPCProviders, string>([
  ["alchemy", "Alchemy"],
  ["infura", "Infura"],
  ["quicknode", "QuickNode"],
  ["ankr", "Ankr"],
  ["helius", "Helius"],
  ["chainstack", "Chainstack"],
]);

export const rpcCredentialsSchema = z.object({
  credentialName: z.literal("rpc_credentials"),
  data: z.object(
    {
      rpc_provider: z.enum(Array.from(providers.keys())),
      api_key: z.string().nonempty(),
      quicknode_endpoint_name: z.string().optional(),
    },
    { error: "Please provide your RPC provider and API key." },
  ),
});

export type RPCCredentialsData = z.infer<typeof rpcCredentialsSchema>;
