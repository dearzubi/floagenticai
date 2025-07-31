import { z } from "zod/v4";
import { OneInchAPIVersions, SupportedNetworks } from "./types.js";
import { removeCommasFromString } from "../../../../utils/misc.js";
import { createHttpClient, HttpClient } from "../../../../utils/http/client.js";
import { Address, Hex, parseUnits, PublicClient, zeroAddress } from "viem";
import { WalletClientWithAccount } from "../../network/evm/client/viem/types.js";
import { NATIVE_ETH_TOKEN_ADDRESS } from "../../network/evm/constants.js";
import { logger } from "../../../../utils/logger/index.js";

/**
 * Validates the 1Inch API key.
 * @param apiKey - The API key to validate.
 * @returns The validated API key if valid.
 * @throws {Error} If the API key is invalid or empty.
 */
export const validateOneInchAPIKey = (apiKey?: string): string => {
  const oneInchApiKeySchema = z
    .string({ error: "A valid 1Inch API key is required." })
    .trim()
    .nonempty({ error: "A valid 1Inch API key is required." });

  const validatedApiKey = oneInchApiKeySchema.safeParse(apiKey);

  if (validatedApiKey.success) {
    return validatedApiKey.data;
  } else {
    throw new Error(validatedApiKey.error.message);
  }
};

/**
 * Validates if the specified network is enabled for 1Inch API usage.
 * @param enabledNetworks - List of enabled networks for 1Inch API.
 * @param networkToUse - The network to validate.
 */
export const validateOneInchNetworkToUse = (
  networkToUse: SupportedNetworks,
  enabledNetworks?: SupportedNetworks[],
): SupportedNetworks => {
  if (
    !enabledNetworks ||
    enabledNetworks.length === 0 ||
    !enabledNetworks.includes(networkToUse)
  ) {
    throw new Error(`${networkToUse} network is not enabled.`);
  }

  return networkToUse;
};

/**
 * Validates the amount for 1Inch token transactions.
 * @param amount - The amount to validate.
 * @param tokenDecimals - The decimals of the token.
 * @returns The validated amount as a string.
 * @throws {Error} If the amount is not a valid number or is less than or equal to zero.
 */
export const validateOneInchTokenAmount = (
  amount: string,
  tokenDecimals: number,
): {
  amount: string;
  amountBigInt: bigint;
} => {
  amount = removeCommasFromString(amount);

  if (isNaN(Number(amount))) {
    throw new Error("Invalid amount. Amount must be a valid number.");
  }

  if (Number(amount) <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  return {
    amount,
    amountBigInt: parseUnits(amount, tokenDecimals),
  };
};

/**
 * Get the base URL for the 1Inch API.
 * @param chainId - EVM Chain ID to use for the API.
 * @param version - Optional OneInch API version, defaults to "6.0".
 */
const getOneInchSwapAPIBaseURL = (
  chainId: number,
  version: OneInchAPIVersions = "6.0",
): string => {
  return `https://api.1inch.dev/swap/v${version}/${chainId}`;
};

/**
 * Get 1Inch API HTTP Client.
 * @param chainId - EVM Chain ID to use for the API.
 * @param oneInchApiKey - API key for OneInch API.
 * @param oneInchApiVersion - Optional OneInch API version, defaults to "6.0".
 */
export const getOneInchAPIHttpClient = ({
  chainId,
  oneInchApiKey,
  oneInchApiVersion = "6.0",
}: {
  chainId: number;
  oneInchApiKey: string;
  oneInchApiVersion?: OneInchAPIVersions;
}): HttpClient => {
  return createHttpClient({
    baseURL: getOneInchSwapAPIBaseURL(chainId, oneInchApiVersion),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${oneInchApiKey}`,
    },
  });
};

/**
 * Retrieves the allowance of a specific token for a given wallet address to interact with the 1inch router.
 */
export const getOneInchRouterTokenAllowance = async ({
  tokenIn,
  accountAddress,
  chainId,
  httpClient,
}: {
  tokenIn: string;
  accountAddress: string;
  chainId: number;
  httpClient: HttpClient;
}): Promise<bigint> => {
  const oneInchRouterAllowanceSchema = z.object({ allowance: z.string() });

  const response = await httpClient.get<
    z.infer<typeof oneInchRouterAllowanceSchema>
  >("/approve/allowance", {
    params: {
      tokenAddress: tokenIn,
      walletAddress: accountAddress,
    },
    retry: {
      attempts: 5,
    },
    cache: {
      enabled: true,
      ttl: 2,
      key: `oneInchRouter-tokenAllowance-${chainId}-${tokenIn}-${accountAddress}`,
    },
    schema: oneInchRouterAllowanceSchema,
  });

  return BigInt(response.allowance);
};

/**
 * Approves token allowance to 1Inch Router.
 */
const approveToken = async ({
  tokenIn,
  amountIn,
  publicClient,
  walletClient,
  httpClient,
}: {
  tokenIn: string;
  amountIn: bigint;
  publicClient: PublicClient;
  walletClient: WalletClientWithAccount;
  httpClient: HttpClient;
}): Promise<Hex> => {
  const oneInchRouterTokenAllowanceDataSchema = z.object({ data: z.string() });

  const response = await httpClient.get<
    z.infer<typeof oneInchRouterTokenAllowanceDataSchema>
  >("/approve/transaction", {
    params: {
      tokenAddress: tokenIn,
      amount: amountIn.toString(),
    },
    retry: {
      attempts: 5,
    },
    schema: oneInchRouterTokenAllowanceDataSchema,
  });

  const hash = await walletClient.sendTransaction({
    to: tokenIn as Address,
    account: walletClient.account,
    chain: publicClient.chain,
    data: response.data as Hex,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
};

/**
 * Approves a specified token allowance for 1Inch Router on behalf of an account address.
 */
export const approveTokenAllowanceToOneInchRouter = async ({
  tokenIn,
  amountIn,
  publicClient,
  walletClient,
  httpClient,
}: {
  tokenIn: string;
  amountIn: bigint;
  publicClient: PublicClient;
  walletClient: WalletClientWithAccount;
  httpClient: HttpClient;
}): Promise<Hex | undefined> => {
  try {
    // It's ETH To Token transfer; no need to approve any allowance
    if ([NATIVE_ETH_TOKEN_ADDRESS, zeroAddress].includes(tokenIn.trim())) {
      return;
    }
    const chainId = await publicClient.getChainId();

    const tokenAllowance = await getOneInchRouterTokenAllowance({
      tokenIn,
      accountAddress: walletClient.account.address,
      chainId,
      httpClient,
    });

    if (tokenAllowance >= amountIn) {
      return;
    }

    let hash: Hex;

    try {
      hash = await approveToken({
        tokenIn,
        amountIn,
        publicClient,
        walletClient,
        httpClient,
      });
    } catch (error) {
      // In case some tokens like USDT require approval reset to zero before initiating a new approval
      await approveToken({
        tokenIn,
        amountIn: 0n,
        publicClient,
        walletClient,
        httpClient,
      });

      hash = await approveToken({
        tokenIn,
        amountIn,
        publicClient,
        walletClient,
        httpClient,
      });
    }

    return hash;
  } catch (error) {
    logger.error(
      `Failed to approve token ${tokenIn} allowance from ${walletClient.account.address} to to 1inch router:`,
      { error },
    );
    throw new Error(
      "Failed to approve token allowance. " +
        (error instanceof Error ? error.message : ""),
    );
  }
};
