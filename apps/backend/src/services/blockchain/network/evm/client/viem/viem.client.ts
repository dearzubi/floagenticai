import { WalletClientWithAccount } from "./types.js";
import {
  Account,
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from "viem";
import * as chains from "viem/chains";
import { SupportedEVMNetworks } from "../../../../rpc/types.js";

/**
 * Get Viem clients for the given network and account.
 * @param network - EVM Network name
 * @param account - EVM Account (Optional). If not provided then wallet client cannot sign.
 * @param rpcEndpoint - RPC Endpoint URL of the network (Optional). If not provided
 * then the default RPC URL for the network will be used, which might be rate limited or down.
 */
export function getViemClients({
  network,
  account,
  rpcEndpoint,
}: {
  network: SupportedEVMNetworks;
  account: Account;
  rpcEndpoint?: string;
}): {
  publicClient: PublicClient;
  walletClient: WalletClientWithAccount;
};
export function getViemClients({
  network,
  account,
  rpcEndpoint,
}: {
  network: SupportedEVMNetworks;
  account?: undefined;
  rpcEndpoint?: string;
}): {
  publicClient: PublicClient;
  walletClient: WalletClient;
};
export function getViemClients({
  network,
  account,
  rpcEndpoint = undefined,
}: {
  network: SupportedEVMNetworks;
  account?: Account;
  rpcEndpoint?: string;
}): {
  publicClient: PublicClient;
  walletClient: WalletClient | WalletClientWithAccount;
} {
  const chain = chains[network];

  const networkDefaultRPC = Array.isArray(chain.rpcUrls.default.http)
    ? chain.rpcUrls.default.http[0]
    : undefined;

  const transport = http(rpcEndpoint ?? networkDefaultRPC);

  const publicClient = createPublicClient({
    chain: chain,
    transport,
  });
  const walletClient = createWalletClient({
    account: account,
    chain: chain,
    transport,
  });

  return {
    publicClient: publicClient as PublicClient,
    walletClient: walletClient as unknown as
      | WalletClient
      | WalletClientWithAccount,
  } as unknown as {
    publicClient: PublicClient;
    walletClient: WalletClient | WalletClientWithAccount;
  };
}
