import { RunContext, tool } from "@openai/agents";
import { OneInchToolsContext } from "./types.js";
import { logger } from "../../../../../../../../utils/logger/index.js";
import { OneInchService } from "../../../../../../../blockchain/platform/oneinch/index.js";
import { AgentToolFactory } from "../../../../../../../ai/agent/types.js";
import { ToolNames } from "../types.js";
import { z } from "zod";
import { SupportedNetworks } from "../../../../../../../blockchain/platform/oneinch/types.js";
import { networksList } from "../../../../../../../blockchain/platform/oneinch/constants.js";

export const quotationArgsSchema = z.object({
  sellToken: z.string().describe("ERC20 token address or symbol to sell."),
  buyToken: z.string().describe("ERC20 token address or symbol to buy."),
  amount: z
    .string()
    .describe(
      "Amount of sellToken to swap. Should be the same as provided by the user, don't convert to token decimals, don't put anny commas or dots.",
    ),
  network: z
    .enum<SupportedNetworks, [SupportedNetworks, ...SupportedNetworks[]]>(
      networksList as [SupportedNetworks, ...SupportedNetworks[]],
      {
        message:
          "Invalid network name. Supported networks are: " +
          networksList.join(", ") +
          ".",
      },
    )
    .describe(
      "Blockchain network to use for the operation. Must ask user to select one.",
    ),
});

/**
 * Tool for the agent to get token swap quotation from 1Inch API.
 */
export const createOneInchQuotationTool: AgentToolFactory<
  OneInchToolsContext
> = (options) => {
  return tool({
    name: "oneinch_quotation_tool" satisfies ToolNames,
    description:
      "Get best quote amount and routes to swap tokens on 1Inch (OneInch) DEX.",
    parameters: quotationArgsSchema,
    needsApproval: options?.needsApproval ?? false,
    async execute(
      { sellToken, buyToken, amount, network },
      ctx?: RunContext<OneInchToolsContext>,
    ) {
      logger.debug(
        `Executing 1Inch quotation tool with parameters: ${JSON.stringify({
          sellToken,
          buyToken,
          amount,
          network,
          enabledNetworks: ctx?.context?.enabledNetworks,
        })}`,
      );

      const oneInchService = await OneInchService.init({
        oneInchApiKey: ctx?.context?.oneInchApiKey,
        network,
        enabledNetworks: ctx?.context?.enabledNetworks,
        signerAccount: undefined,
        rpcProvider: ctx?.context?.rpcProvider,
      });

      const quote = await oneInchService.quote.get({
        sellToken,
        buyToken,
        amount,
      });

      return JSON.stringify(quote, null, 2);
    },
    errorFunction: (_ctx, error) => {
      logger.error(`1Inch quotation failed: `, { error });
      return JSON.stringify(
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to get 1Inch quotation",
          code: "1INCH_QUOTATION_ERROR",
        },
        null,
        2,
      );
    },
  });
};
