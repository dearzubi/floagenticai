import { Account } from "viem";
import { RPCProvider } from "../../rpc/types.js";

export type SupportedNetworks =
  | "mainnet"
  | "base"
  | "arbitrum"
  | "optimism"
  | "polygon"
  | "avalanche"
  | "linea"
  | "bsc"
  | "gnosis";

export type InitialiseOneInchServiceArgs = {
  oneInchApiKey?: string;
  network: SupportedNetworks;
  enabledNetworks?: SupportedNetworks[];
  signerAccount?: Account;
  rpcProvider?: RPCProvider;
};

export type OneInchAPIVersions = "6.0";
