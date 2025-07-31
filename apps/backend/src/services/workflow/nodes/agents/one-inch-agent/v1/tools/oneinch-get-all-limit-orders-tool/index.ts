import { RunContext, Tool, tool } from "@openai/agents";
import { name, description, argsSchema } from "./info.js";
import { Hex } from "viem";
import { OneInchToolsContext } from "../types.js";
import { logger } from "../../../../../../../../utils/logger/index.js";
import { privateKeyToAccount } from "viem/accounts";
import { OneInchService } from "../../../../../../../blockchain/platform/oneinch/index.js";

/**
 * Tool for the agent get all limit orders for an address using 1Inch.
 */
export const oneInchGetAllLimitOrdersTool = (
  needsApproval?: boolean,
): Tool<OneInchToolsContext> => {
  return tool({
    name: name,
    description: description,
    parameters: argsSchema,
    needsApproval,
    async execute({ network, status }, ctx?: RunContext<OneInchToolsContext>) {
      if (!ctx?.context?.evmPrivateKey) {
        throw new Error("Private key is required to sign swap transaction");
      }

      const account = privateKeyToAccount(ctx?.context.evmPrivateKey as Hex);

      logger.debug(
        `Executing 1Inch get all limit orders with parameters: ${JSON.stringify(
          {
            account: account.address,
            network,
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

      const orders = await oneInchService.limitOrders.getAllLimitOrders(status);

      return JSON.stringify(
        {
          orders,
          network,
        },
        null,
        2,
      );
    },
    errorFunction: (_ctx, error) => {
      logger.error(`1Inch get all limit orders failed: `, { error });
      return JSON.stringify(
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to get all limit orders from 1Inch.",
          code: "1INCH_LIMIT_ORDER_ERROR",
        },
        null,
        2,
      );
    },
  });
};
