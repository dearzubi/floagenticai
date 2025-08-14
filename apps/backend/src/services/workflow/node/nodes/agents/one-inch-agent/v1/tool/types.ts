import { RPCProvider } from "../../../../../../../blockchain/rpc/types.js";
import { SupportedNetworks } from "../../../../../../../blockchain/platform/oneinch/types.js";

export type OneInchToolsContext = {
  oneInchApiKey?: string;
  rpcProvider?: RPCProvider;
  evmPrivateKey?: string;
  enabledNetworks?: SupportedNetworks[];
};
