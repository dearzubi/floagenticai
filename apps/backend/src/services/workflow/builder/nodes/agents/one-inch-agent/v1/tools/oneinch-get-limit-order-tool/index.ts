import { RunContext, Tool, tool } from "@openai/agents";
import { name, description, argsSchema } from "./info.js";
import { OneInchToolsContext } from "../types.js";
import { logger } from "../../../../../../../../../utils/logger/index.js";
import { OneInchService } from "../../../../../../../../blockchain/platform/oneinch/index.js";

/**
 * Tool for the agent get limit order by order hash using 1Inch.
 */
export const oneInchGetLimitOrderTool = (
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
      logger.debug(
        `Executing 1Inch get limit order by hash with parameters: ${JSON.stringify(
          {
            orderHash,
            network,
          },
        )}`,
      );

      const oneInchService = await OneInchService.init({
        oneInchApiKey: ctx?.context?.oneInchApiKey,
        network,
        enabledNetworks: ctx?.context?.enabledNetworks,
        signerAccount: undefined,
        rpcProvider: ctx?.context?.rpcProvider,
      });

      const order = await oneInchService.limitOrders.getLimitOrder(orderHash);

      return JSON.stringify(
        {
          order,
          network,
        },
        null,
        2,
      );
    },
    errorFunction: (_ctx, error) => {
      logger.error(`1Inch get limit order failed: `, { error });
      return JSON.stringify(
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to get limit order from 1Inch.",
          code: "1INCH_LIMIT_ORDER_ERROR",
        },
        null,
        2,
      );
    },
  });
};
