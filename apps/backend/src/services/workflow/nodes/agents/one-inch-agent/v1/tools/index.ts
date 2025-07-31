import { ToolNames } from "../types.js";
import { Tool } from "@openai/agents";
import { oneInchQuotationTool } from "./oneinch-quotation-tool/index.js";
import { OneInchToolsContext } from "./types.js";
import { oneInchSwapTool } from "./oneinch-swap-tool/index.js";
import { oneInchCreateLimitOrderTool } from "./oneinch-create-limit-order-tool/index.js";
import { oneInchGetAllLimitOrdersTool } from "./oneinch-get-all-limit-orders-tool/index.js";
import { oneInchGetLimitOrderTool } from "./oneinch-get-limit-order-tool/index.js";
import { oneInchCancelLimitOrderTool } from "./oneinch-cancel-limit-order-tool/index.js";
import { NodePropertyOption } from "common";

export const oneInchTools: Partial<
  Record<ToolNames, (needsApproval?: boolean) => Tool<OneInchToolsContext>>
> = {
  oneinch_quotation_tool: oneInchQuotationTool,
  oneinch_swap_tool: oneInchSwapTool,
  oneinch_create_limit_order_tool: oneInchCreateLimitOrderTool,
  oneinch_get_address_limit_orders_tool: oneInchGetAllLimitOrdersTool,
  oneinch_get_limit_order_tool: oneInchGetLimitOrderTool,
  oneinch_cancel_limit_order_tool: oneInchCancelLimitOrderTool,
};

export const toolOptions = [
  {
    name: "oneinch_quotation_tool",
    label: "1Inch Quotation Tool",
    description: "Get the best quote for swapping tokens using 1Inch DEX.",
  } satisfies NodePropertyOption & { name: ToolNames },
  {
    name: "oneinch_swap_tool",
    label: "1Inch Swap Tool",
    description: "Swap tokens using 1Inch DEX.",
  } satisfies NodePropertyOption & { name: ToolNames },
  {
    name: "oneinch_create_limit_order_tool",
    label: "1Inch Create Limit Order Tool",
    description: "Place limit orders for token swaps on 1Inch DEX.",
  } satisfies NodePropertyOption & { name: ToolNames },
  {
    name: "oneinch_get_limit_order_tool",
    label: "1Inch Get Limit Order Tool",
    description:
      "Get details of a specific limit order from 1Inch DEX using order hash.",
  } satisfies NodePropertyOption & { name: ToolNames },
  {
    name: "oneinch_cancel_limit_order_tool",
    label: "1Inch Cancel Limit Order Tool",
    description: "Cancel a specific limit order on 1Inch DEX.",
  } satisfies NodePropertyOption & { name: ToolNames },
  {
    name: "oneinch_get_address_limit_orders_tool",
    label: "1Inch Get Address Limit Orders Tool",
    description: "Get all limit orders for a specific address from 1Inch DEX.",
  } satisfies NodePropertyOption & { name: ToolNames },
];
