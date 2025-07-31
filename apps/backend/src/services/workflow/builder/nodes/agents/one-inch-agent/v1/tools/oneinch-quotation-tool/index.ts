import { RunContext, Tool, tool } from "@openai/agents";
import { name, description, argsSchema } from "./info.js";
import { OneInchToolsContext } from "../types.js";
import { logger } from "../../../../../../../../../utils/logger/index.js";
import { OneInchService } from "../../../../../../../../blockchain/platform/oneinch/index.js";

/**
 * Tool for the agent to get token swap quotation from 1Inch API.
 */
export const oneInchQuotationTool = (
  needsApproval?: boolean,
): Tool<OneInchToolsContext> => {
  return tool({
    name: name,
    description: description,
    parameters: argsSchema,
    needsApproval,
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
