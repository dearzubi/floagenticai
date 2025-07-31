import { RunContext, Tool, tool } from "@openai/agents";
import { name, description, argsSchema } from "./info.js";
import { Hex } from "viem";
import { OneInchToolsContext } from "../types.js";
import { logger } from "../../../../../../../../../utils/logger/index.js";
import { privateKeyToAccount } from "viem/accounts";
import { OneInchService } from "../../../../../../../../blockchain/platform/oneinch/index.js";

/**
 * Tool for the agent create limit order using 1Inch.
 */
export const oneInchCreateLimitOrderTool = (
  needsApproval?: boolean,
): Tool<OneInchToolsContext> => {
  return tool({
    name: name,
    description: description,
    parameters: argsSchema,
    needsApproval,
    async execute(
      { sellToken, buyToken, amountBuy, amountSell, network, expiryDays },
      ctx?: RunContext<OneInchToolsContext>,
    ) {
      if (!ctx?.context?.evmPrivateKey) {
        throw new Error("Private key is required to sign swap transaction");
      }

      const account = privateKeyToAccount(ctx?.context.evmPrivateKey as Hex);

      logger.debug(
        `Executing 1Inch create limit order with parameters: ${JSON.stringify({
          sellToken,
          buyToken,
          amountBuy,
          network,
          amountSell,
          expiryDays,
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

      const orderHash = await oneInchService.limitOrders.createLimitOrder({
        sellToken,
        buyToken,
        amountSell,
        amountBuy,
        expiryDays,
      });

      return `Limit order created.\n\n ${JSON.stringify(
        {
          orderHash,
          sellToken,
          buyToken,
          amountBuy,
          amountSell,
          network,
        },
        null,
        2,
      )}`;
    },
    errorFunction: (_ctx, error) => {
      logger.error(`1Inch create limit order failed: `, { error });
      return JSON.stringify(
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to create limit order with 1Inch.",
          code: "1INCH_LIMIT_ORDER_ERROR",
        },
        null,
        2,
      );
    },
  });
};
