import { RunContext, Tool, tool } from "@openai/agents";
import { name, description, argsSchema } from "./info.js";
import { OneInchToolsContext } from "../types.js";
import { logger } from "../../../../../../../../../utils/logger/index.js";
import { OneInchService } from "../../../../../../../../blockchain/platform/oneinch/index.js";
import { privateKeyToAccount } from "viem/accounts";
import { Hex } from "viem";

/**
 * Tool for the agent cancel limit order by order hash using 1Inch.
 */
export const oneInchCancelLimitOrderTool = (
  needsApproval?: boolean,
): Tool<OneInchToolsContext> => {
  return tool({
    name: name,
    description: description,
    parameters: argsSchema,
    needsApproval,
    async execute(
      { network, orderHash },
      ctx?: RunContext<OneInchToolsContext>,
    ) {
      if (!ctx?.context?.evmPrivateKey) {
        throw new Error("Private key is required to sign swap transaction");
      }

      const account = privateKeyToAccount(ctx?.context.evmPrivateKey as Hex);

      logger.debug(
        `Executing 1Inch cancel limit order by hash with parameters: ${JSON.stringify(
          {
            orderHash,
            network,
            account: account.address,
          },
        )}`,
      );

      const oneInchService = await OneInchService.init({
        oneInchApiKey: ctx?.context?.oneInchApiKey,
        network,
        enabledNetworks: ctx?.context?.enabledNetworks,
        signerAccount: account,
        rpcProvider: ctx?.context?.rpcProvider,
      });

      const tx = await oneInchService.limitOrders.cancelLimitOrder(orderHash);

      return JSON.stringify(
        {
          message: "Limit order cancelled successfully.",
          tx,
          network,
        },
        null,
        2,
      );
    },
    errorFunction: (_ctx, error) => {
      logger.error(`1Inch cancel limit order failed: `, { error });
      return JSON.stringify(
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to cancel limit order from 1Inch.",
          code: "1INCH_LIMIT_ORDER_ERROR",
        },
        null,
        2,
      );
    },
  });
};
