import { z } from "zod";
import { ToolNames } from "../../types.js";
import { supportedNetworks } from "../../../../../../../blockchain/platform/oneinch/constants.js";
import { SupportedNetworks } from "../../../../../../../blockchain/platform/oneinch/types.js";

const networksList = Array.from(supportedNetworks.keys());

export const name = "oneinch_quotation_tool" satisfies ToolNames;

export const description = `Get best quote amount and routes to swap tokens on 1Inch (OneInch) DEX.`;

export const argsSchema = z.object({
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
