import { ToolNames } from "../../types.js";
import { argsSchema as getArgsSchema } from "../oneinch-get-limit-order-tool/info.js";

export const name = "oneinch_cancel_limit_order_tool" satisfies ToolNames;

export const description = `Cancel a limit order by order hash on 1Inch (OneInch) DEX.`;

export const argsSchema = getArgsSchema;
