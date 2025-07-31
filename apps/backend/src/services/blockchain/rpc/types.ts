export type RPCProviders =
  | "alchemy"
  | "infura"
  | "quicknode"
  | "ankr"
  | "helius"
  | "chainstack";

export type SupportedNetworks =
  | "mainnet"
  | "arbitrum"
  | "avalanche"
  | "base"
  | "bsc"
  | "celo"
  | "linea"
  | "optimism"
  | "polygon"
  | "sonic"
  | "gnosis"
  | "unichain"
  | "zksync"
  | "mantle"
  | "sepolia"
  | "baseSepolia"
  | "arbitrumSepolia"
  | "optimismSepolia"
  | "solana";

export type SupportedEVMNetworks = Exclude<SupportedNetworks, "solana">;

export type RPCProvider<T extends RPCProviders = RPCProviders> = {
  provider: T;
  apiKey: string;
  quickNodeEndpointName: T extends "quicknode" ? string : undefined;
};
