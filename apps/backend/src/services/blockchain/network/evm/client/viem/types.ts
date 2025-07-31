import { Account, PublicClient, WalletClient } from "viem";

export type WalletClientWithAccount = Exclude<WalletClient, "account"> & {
  account: Account;
};

export type ViemClients = {
  publicClient: PublicClient;
  walletClient: WalletClientWithAccount | WalletClient;
};
