import { z } from "zod";

import { ToolNames } from "../../types.js";
import { argsSchema as quotationArgsSchema } from "../oneinch-quotation-tool/info.js";

export const name = "oneinch_swap_tool" satisfies ToolNames;

export const description = `Swap tokens on 1Inch (OneInch) DEX.`;

export const argsSchema = quotationArgsSchema.extend({
  slippagePercentage: z
    .number()
    .default(1)
    .describe("Slippage percentage for the swap. Default is 1%."),
});
