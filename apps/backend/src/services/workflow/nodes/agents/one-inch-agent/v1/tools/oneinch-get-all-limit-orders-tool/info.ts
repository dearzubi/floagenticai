import { z } from "zod";
import { ToolNames } from "../../types.js";
import { argsSchema as quotationArgsSchema } from "../oneinch-quotation-tool/info.js";

export const name = "oneinch_get_address_limit_orders_tool" satisfies ToolNames;

export const description = `Get all limit orders for a specific address 1Inch (OneInch) DEX.`;

export const argsSchema = quotationArgsSchema
  .pick({
    network: true,
  })
  .extend({
    status: z
      .enum(["active", "expired", "cancelled"])
      .optional()
      .default("active")
      .describe("Current limit order status to filter. Default is active."),
  });
