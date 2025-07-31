import { RunContext, Tool, tool } from "@openai/agents";
import { name, description, argsSchema } from "./info.js";
import { Hex } from "viem";
import { OneInchToolsContext } from "../types.js";
import { logger } from "../../../../../../../../../utils/logger/index.js";
import { privateKeyToAccount } from "viem/accounts";
import { OneInchService } from "../../../../../../../../blockchain/platform/oneinch/index.js";

/**
 * Tool for the agent to do token swap using 1Inch API.
 */
export const oneInchSwapTool = (
  needsApproval?: boolean,
): Tool<OneInchToolsContext> => {
  return tool({
    name: name,
    description: description,
    parameters: argsSchema,
    needsApproval,
    async execute(
      { sellToken, buyToken, amount, network, slippagePercentage },
      ctx?: RunContext<OneInchToolsContext>,
    ) {
      if (!ctx?.context?.evmPrivateKey) {
        throw new Error("Private key is required to sign swap transaction");
      }

      const account = privateKeyToAccount(ctx?.context.evmPrivateKey as Hex);

      logger.debug(
        `Executing 1Inch swap with parameters: ${JSON.stringify({
          sellToken,
          buyToken,
          amount,
          network,
          slippagePercentage,
          account: account.address,
        })}`,
      );

      const oneInchService = await OneInchService.init({
        oneInchApiKey: ctx?.context?.oneInchApiKey,
        network,
        enabledNetworks: ctx?.context?.enabledNetworks,
        signerAccount: account,
        rpcProvider: ctx?.context?.rpcProvider,
      });

      const txLink = await oneInchService.swap.swapTokens({
        sellToken,
        buyToken,
        amount,
        slippagePercentage,
      });

      return `Swap successfully completed.\n\n ${JSON.stringify(
        {
          sellToken,
          buyToken,
          amount,
          network,
          tx: txLink,
        },
        null,
        2,
      )}`;
    },
    errorFunction: (_ctx, error) => {
      logger.error(`1Inch swap failed: `, { error });
      return JSON.stringify(
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to swap tokens with 1Inch.",
          code: "1INCH_SWAP_ERROR",
        },
        null,
        2,
      );
    },
  });
};
