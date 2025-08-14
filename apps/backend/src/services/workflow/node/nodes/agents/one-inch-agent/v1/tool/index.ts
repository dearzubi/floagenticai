import { ToolNames } from "../types.js";
import { OneInchToolsContext } from "./types.js";
import { NodePropertyOption } from "common";
import { AgentToolFactory } from "../../../../../../../ai/agent/types.js";
import { createOneInchQuotationTool } from "./quotation.tool.js";
import { createOneInchSwapTool } from "./swap.tool.js";
import { createOneInchCreateLimitOrderTool } from "./create.limit.order.tool.js";
import { createOneInchGetLimitOrderTool } from "./get.limit.order.tool.js";
import { createOneInchGetAllLimitOrdersTool } from "./get.all.limit.orders.tool.js";
import { createOneInchCancelLimitOrderTool } from "./cancel.limit.order.tool.js";

export const oneInchToolFactories = new Map<
  ToolNames,
  AgentToolFactory<OneInchToolsContext>
>()
  .set("oneinch_quotation_tool", createOneInchQuotationTool)
  .set("oneinch_swap_tool", createOneInchSwapTool)
  .set("oneinch_create_limit_order_tool", createOneInchCreateLimitOrderTool)
  .set("oneinch_get_limit_order_tool", createOneInchGetLimitOrderTool)
  .set(
    "oneinch_get_address_limit_orders_tool",
    createOneInchGetAllLimitOrdersTool,
  )
  .set("oneinch_cancel_limit_order_tool", createOneInchCancelLimitOrderTool);

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
