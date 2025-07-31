import { OneInchService } from "../index.js";
import { OneInchSwapTokensArgs } from "./types.js";
import {
  getERC20TokenBalance,
  getERC20TokenInfo,
} from "../../../token/erc20/utils.js";
import {
  approveTokenAllowanceToOneInchRouter,
  validateOneInchTokenAmount,
} from "../utils.js";
import { formatUnits, Hex } from "viem";
import { WalletClientWithAccount } from "../../../network/evm/client/viem/types.js";
import { z } from "zod/v4";
import { getEVMTxExplorerUrl } from "../../../network/evm/utils/tx.js";

const oneInchSwapTxSchema = z.object({
  tx: z.object({ data: z.string(), to: z.string(), value: z.string() }),
});

export type OneInchSwapTxSchema = z.infer<typeof oneInchSwapTxSchema>;

export class Swap {
  constructor(private service: OneInchService) {}

  async swapTokens({
    sellToken,
    buyToken,
    amount,
    slippagePercentage,
  }: OneInchSwapTokensArgs): Promise<string> {
    const publicClient = this.service.clients.publicClient;
    const walletClient = this.service.clients
      .walletClient as WalletClientWithAccount;
    const httpClient = this.service.httpClient;

    const [tokenIn, tokenOut] = await Promise.all([
      getERC20TokenInfo(sellToken, publicClient),
      getERC20TokenInfo(buyToken, publicClient),
    ]);
    const amounts = validateOneInchTokenAmount(amount, tokenIn.decimals);

    const amountIn = amounts.amountBigInt;

    const userTokenBalance = await getERC20TokenBalance(
      tokenIn.address,
      walletClient.account.address,
      publicClient,
    );

    if (amountIn > userTokenBalance) {
      throw new Error(
        `You don't have enough ${tokenIn.symbol} balance to swap. Swap amount: ${amounts.amount}. Available balance: ${formatUnits(
          userTokenBalance,
          tokenIn.decimals,
        )}.`,
      );
    }

    await approveTokenAllowanceToOneInchRouter({
      tokenIn: tokenIn.address,
      amountIn,
      publicClient,
      walletClient,
      httpClient,
    });

    const response = await httpClient.get<OneInchSwapTxSchema>("/swap", {
      params: {
        src: tokenIn.address,
        dst: tokenOut.address,
        amount: amountIn.toString(),
        from: walletClient.account.address,
        origin: walletClient.account.address,
        slippage: slippagePercentage.toString(),
      },
      retry: {
        attempts: 5,
      },
      schema: oneInchSwapTxSchema,
    });

    const hash = await walletClient.sendTransaction({
      to: response.tx.to as Hex,
      account: walletClient.account,
      chain: publicClient.chain,
      data: response.tx.data as Hex,
      value: response.tx.value ? BigInt(response.tx.value) : 0n,
    });

    const txLink = getEVMTxExplorerUrl(hash, publicClient);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "reverted") {
      throw new Error(
        `Swap transaction reverted for unknown reason. Please try again. Tx: ${txLink}`,
      );
    }

    return txLink;
  }
}
