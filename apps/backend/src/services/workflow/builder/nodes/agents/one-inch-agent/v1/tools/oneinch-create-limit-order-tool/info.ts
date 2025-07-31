import { z } from "zod";

import { ToolNames } from "../../types.js";
import { argsSchema as quotationArgsSchema } from "../oneinch-quotation-tool/info.js";

export const name = "oneinch_create_limit_order_tool" satisfies ToolNames;

export const description = `Place limit order on 1Inch (OneInch) DEX.`;

export const argsSchema = quotationArgsSchema
  .pick({
    sellToken: true,
    buyToken: true,
    network: true,
  })
  .extend({
    amountSell: z
      .string()
      .describe(
        "Amount of tokens to sell. Should be the same as provided by the user, don't convert to token decimals, don't put anny commas or dots.",
      ),
    amountBuy: z
      .string()
      .describe(
        "Amount of tokens to buy. Should be the same as provided by the user, don't convert to token decimals, don't put anny commas or dots.",
      ),
    expiryDays: z
      .number()
      .optional()
      .default(7)
      .describe("Number of days for the limit order to expire. Default is 7."),
  });
