import { ToolNames } from "../../types.js";
import { argsSchema as quotationArgsSchema } from "../oneinch-quotation-tool/info.js";
import { z } from "zod";

export const name = "oneinch_get_limit_order_tool" satisfies ToolNames;

export const description = `Get a limit order by order hash from 1Inch (OneInch) DEX.`;

export const argsSchema = quotationArgsSchema
  .pick({
    network: true,
  })
  .extend({
    orderHash: z.string().describe("Order hash"),
  });
