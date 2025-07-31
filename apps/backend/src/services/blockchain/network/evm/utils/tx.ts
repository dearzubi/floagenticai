import { PublicClient } from "viem";

/**
 * Get the EVM transaction explorer URL for a given transaction hash.
 * @param txHash - The transaction hash to look up.
 * @param publicClient - The public client instance used to interact with the blockchain.
 */
export const getEVMTxExplorerUrl = (
  txHash: string,
  publicClient: PublicClient,
): string => {
  return typeof publicClient.chain?.blockExplorers?.default.url === "string"
    ? publicClient.chain?.blockExplorers?.default.url + "/tx/" + txHash
    : txHash;
};
