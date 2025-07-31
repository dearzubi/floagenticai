import { Address, Hex, isAddressEqual, PublicClient, zeroAddress } from "viem";
import { NATIVE_ETH_TOKEN_ADDRESS } from "../../network/evm/constants.js";
import { createHttpClient } from "../../../../utils/http/client.js";
import { ERC20_TOKEN_ABI } from "./abis/erc20-token.abi.js";
import { logger } from "../../../../utils/logger/index.js";
import { TokensList, tokensListSchema } from "./schemas.js";
import { ERC20TokenInfo } from "./types.js";
import { isValidEthereumAddress } from "../../network/evm/utils/address.js";
import { WalletClientWithAccount } from "../../network/evm/client/viem/types.js";

/**
 * Fetches the Uniswap token list from IPFS and caches it.
 *
 * @throws {Error} If the API request fails, the response has invalid data, or another error occurs during execution.
 */
const getUniswapTokensList = async (): Promise<TokensList> => {
  const httpClient = createHttpClient({
    baseURL: "https://tokens-uniswap-org.ipns.dweb.link",
    cache: {
      enabled: true,
      defaultTTL: 60 * 60 * 24, // 24 hours in seconds,
    },
  });
  try {
    const response = await httpClient.get("/", {
      headers: {
        "Content-Type": "application/json",
      },
      cache: {
        key: "uniswap_tokens_list",
      },
      schema: tokensListSchema,
    });
    return response.tokens;
  } catch (error) {
    logger.error("Failed to get Uniswap tokens list.", { error });
    throw new Error(
      `Failed to fetch token list: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Resolves a token address from a given symbol and chain ID using the Uniswap token list.
 * It also supports native token symbols e.g. ETH.
 *
 * @param {string} tokenSymbol - The symbol of the token to be resolved.
 * @param {number} chainId - The chain ID of the blockchain network to filter the token.
 * @param useZeroAddressForNativeToken - Whether to use `0x0000000000000000000000000000000000000000` or `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
 * for native token address e.g. ETH. Default to `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
 * @returns {Promise<Address>} The resolved token address matching the given symbol and chain ID.
 * @throws {Error} Throws an error if the token cannot be found or there is an issue with fetching the token list.
 */
export const resolveERC20TokenSymbolToAddress = async (
  tokenSymbol: string,
  chainId: number,
  useZeroAddressForNativeToken?: boolean,
): Promise<string> => {
  try {
    if (["eth", "ethereum"].includes(tokenSymbol.toLowerCase())) {
      return useZeroAddressForNativeToken
        ? zeroAddress
        : NATIVE_ETH_TOKEN_ADDRESS;
    }

    const tokenListData = await getUniswapTokensList();

    const token = tokenListData.find(
      (token) =>
        token.symbol.toLowerCase() === tokenSymbol.toLowerCase() &&
        token.chainId == chainId,
    );
    if (token) {
      return token.address;
    }
  } catch (error) {
    logger.error("Failed to resolve ERC20 token symbol to address", { error });
  }

  throw new Error(
    `Could not resolve token symbol '${tokenSymbol}' to address. Please provide the token address manually or check if the token symbol and network is correct.`,
  );
};

/**
 * Fetches ERC20 token information, including decimals, symbol, and name, from the blockchain using a public client.
 * Also supports native token e.g. ETH.
 *
 * @param {string} tokenAddressOrSymbol - The address of the token contract to query or token symbol.
 * @param {PublicClient} publicClient - The public client used to interact with the blockchain.
 * @returns {Promise<ERC20TokenInfo>} A promise that resolves to an object containing the token's decimals, symbol, and name.
 * @throws {Error} Throws an error if the token symbol cannot be resolved to address or client throws error while fetching token info.
 */
export const getERC20TokenInfo = async (
  tokenAddressOrSymbol: string,
  publicClient: PublicClient,
): Promise<ERC20TokenInfo> => {
  let tokenAddress = tokenAddressOrSymbol;

  const chainId = await publicClient.getChainId();

  if (!isValidEthereumAddress(tokenAddress)) {
    tokenAddress = await resolveERC20TokenSymbolToAddress(
      tokenAddressOrSymbol,
      chainId,
      false,
    );
  }

  // Handle native token e.g. ETH
  if (
    isAddressEqual(
      tokenAddress as unknown as Address,
      NATIVE_ETH_TOKEN_ADDRESS,
    ) ||
    isAddressEqual(tokenAddress as unknown as Address, zeroAddress)
  ) {
    return {
      address: tokenAddress,
      decimals:
        typeof publicClient.chain?.nativeCurrency?.decimals === "number"
          ? publicClient.chain?.nativeCurrency?.decimals
          : 18,
      symbol: publicClient.chain?.nativeCurrency?.symbol ?? "ETH",
      name: publicClient.chain?.nativeCurrency?.name ?? "Ether",
    };
  }

  // Handle ERC20 token
  const [decimals, symbol, name] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress as unknown as Address,
      abi: ERC20_TOKEN_ABI,
      functionName: "decimals",
    }),
    publicClient.readContract({
      address: tokenAddress as unknown as Address,
      abi: ERC20_TOKEN_ABI,
      functionName: "symbol",
    }),
    publicClient.readContract({
      address: tokenAddress as unknown as Address,
      abi: ERC20_TOKEN_ABI,
      functionName: "name",
    }),
  ]);

  return {
    address: tokenAddress,
    decimals,
    symbol,
    name,
  };
};

/**
 * Retrieves the token balance of a specific account for a given ERC-20 token (or native token)
 * Also supports native token e.g. ETH.
 *
 * @param {string} tokenAddress - The address of the ERC-20 token contract (or native token)
 * @param {string} accountAddress - The address of the account whose balance is to be retrieved.
 * @param {PublicClient} publicClient - The public client instance used to interact with the blockchain.
 * @returns {Promise<bigint>} A promise that resolves to the balance of the account in the given token's decimals
 */
export const getERC20TokenBalance = async (
  tokenAddress: string,
  accountAddress: string,
  publicClient: PublicClient,
): Promise<bigint> => {
  if (
    isAddressEqual(tokenAddress as Address, NATIVE_ETH_TOKEN_ADDRESS) ||
    isAddressEqual(tokenAddress as Address, zeroAddress)
  ) {
    return await publicClient.getBalance({
      address: accountAddress as Address,
    });
  }

  return await publicClient.readContract({
    address: tokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: "balanceOf",
    args: [accountAddress as Address],
  });
};

/**
 * Retrieves the allowance of a specified spender for a specific ERC20 token on behalf of an account.
 *
 * @param {Address} tokenAddress - The address of the ERC20 token whose allowance is being queried.
 * @param {Address} accountAddress - The address of the account that granted the allowance.
 * @param {Address} spenderAddress - The address of the spender for whom the allowance is granted.
 * @param {PublicClient} publicClient - The client instance to interact with the blockchain.
 * @returns {Promise<bigint>} A promise that resolves to the allowance amount as a bigint.
 * @throws {Error} If the blockchain request fails or an error occurs during execution.
 */
export const getERC20TokenAllowance = async ({
  tokenAddress,
  accountAddress,
  spenderAddress,
  publicClient,
}: {
  tokenAddress: string;
  accountAddress: string;
  spenderAddress: string;
  publicClient: PublicClient;
}): Promise<bigint> => {
  if (
    isAddressEqual(tokenAddress as Address, NATIVE_ETH_TOKEN_ADDRESS) ||
    isAddressEqual(tokenAddress as Address, zeroAddress)
  ) {
    return 0n;
  }

  return publicClient.readContract({
    address: tokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: "allowance",
    args: [accountAddress as Address, spenderAddress as Address],
  });
};

/**
 * Approves a specified ERC20 token for a spender to spend on behalf of an account.
 *
 * @param {Address} tokenAddress - The address of the ERC20 token contract.
 * @param {Address} spenderAddress - The address of the spender to approve.
 * @param {bigint} amount - The amount of tokens to approve for the spender.
 * @param {PublicClient} publicClient - Client instance for simulating and interacting with the blockchain.
 * @param {WalletClientWithAccount} walletClient - Client instance for sending and managing raw transactions. Must have private key account hoisted.
 * @returns {Promise<Hex>} A promise that resolves to the transaction hash of the approval process.
 */
const approveERC20Token = async ({
  tokenAddress,
  spenderAddress,
  amount,
  publicClient,
  walletClient,
}: {
  tokenAddress: string;
  spenderAddress: string;
  amount: bigint;
  publicClient: PublicClient;
  walletClient: WalletClientWithAccount;
}): Promise<Hex> => {
  const { request } = await publicClient.simulateContract({
    account: walletClient.account,
    address: tokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: "approve",
    args: [spenderAddress as Address, amount],
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
};

/**
 * Approves a designated amount of ERC20 tokens to a specified spender address.
 *
 * @param tokenAddress The address of the ERC20 token contract to approve.
 * @param accountAddress The Ethereum account address that owns the tokens to be approved.
 * @param spenderAddress The address of the spender to approve.
 * @param amount The amount of tokens (in smallest denomination) to approve for the spender.
 * @param publicClient The public client used for blockchain interactions (e.g., retrieving gas fees, nonce, etc.).
 * @param walletClient The wallet client responsible for blockchain interactions with the custodial wallet. Must have private key account hoisted.
 * @returns A promise that resolves to the transaction hash as a hex string once the transaction is successfully sent.
 */
export const approveERC20TokenAllowance = async ({
  tokenAddress,
  accountAddress,
  spenderAddress,
  amount,
  publicClient,
  walletClient,
}: {
  tokenAddress: string;
  accountAddress: string;
  spenderAddress: string;
  amount: bigint;
  publicClient: PublicClient;
  walletClient: WalletClientWithAccount;
}): Promise<Hex | undefined> => {
  if (
    isAddressEqual(tokenAddress as Address, NATIVE_ETH_TOKEN_ADDRESS) ||
    isAddressEqual(tokenAddress as Address, zeroAddress)
  ) {
    return;
  }

  const tokenAllowance = await getERC20TokenAllowance({
    tokenAddress,
    accountAddress,
    spenderAddress,
    publicClient,
  });

  if (
    (amount !== 0n && tokenAllowance >= amount) ||
    (amount === 0n && tokenAllowance === 0n)
  ) {
    return;
  }

  try {
    return approveERC20Token({
      tokenAddress,
      spenderAddress,
      amount,
      publicClient,
      walletClient,
    });
  } catch (error) {
    if (amount === 0n) {
      throw error;
    }
    // In case some tokens like USDT requires approval reset to zero before initiating a new approval
    // without resetting will throw error
    await approveERC20Token({
      tokenAddress,
      spenderAddress,
      amount: 0n,
      publicClient,
      walletClient,
    });
    return approveERC20Token({
      tokenAddress,
      spenderAddress,
      amount,
      publicClient,
      walletClient,
    });
  }
};
