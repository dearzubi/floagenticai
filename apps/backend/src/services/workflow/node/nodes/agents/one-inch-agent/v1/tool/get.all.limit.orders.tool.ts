import { RunContext, tool } from "@openai/agents";

import { Hex } from "viem";
import { OneInchToolsContext } from "./types.js";
import { logger } from "../../../../../../../../utils/logger/index.js";
import { privateKeyToAccount } from "viem/accounts";
import { OneInchService } from "../../../../../../../blockchain/platform/oneinch/index.js";
import { ToolNames } from "../types.js";
import { z } from "zod";
import { quotationArgsSchema } from "./quotation.tool.js";
import { AgentToolFactory } from "../../../../../../../ai/agent/types.js";

/**
 * Tool for the agent get all limit orders for an address using 1Inch.
 */
export const createOneInchGetAllLimitOrdersTool: AgentToolFactory<
  OneInchToolsContext
> = (options) => {
  return tool({
    name: "oneinch_get_address_limit_orders_tool" satisfies ToolNames,
    description:
      "Get all limit orders for a specific address 1Inch (OneInch) DEX.",
    parameters: quotationArgsSchema
      .pick({
        network: true,
      })
      .extend({
        status: z
          .enum(["active", "expired", "cancelled"])
          .optional()
          .default("active")
          .describe("Current limit order status to filter. Default is active."),
      }),
    needsApproval: options?.needsApproval ?? false,
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
