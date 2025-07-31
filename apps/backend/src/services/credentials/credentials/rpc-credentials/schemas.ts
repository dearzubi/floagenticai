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
  name: z.literal("rpc_credentials"),
  data: z.object({
    rpc_provider: z.enum(Array.from(providers.keys())),
    api_key: z.string().nonempty(),
    quicknode_endpoint_name: z.string().optional(),
  }),
});

export type RPCCredentials = z.infer<typeof rpcCredentialsSchema>;
