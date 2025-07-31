import { toolNames } from "./constants.js";

export type ToolNames = typeof toolNames extends Set<infer K> ? K : never;
