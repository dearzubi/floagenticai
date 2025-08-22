export const agentNodeNames = [
  "agent",
  "aggregator_agent",
  "router_agent",
  "one_inch_agent",
] as const;
export const triggerNodeNames = ["manual_trigger", "chat_trigger"] as const;
export const nodeNames = [...agentNodeNames, ...triggerNodeNames] as const;
export const nodeCategories = ["Agents", "Triggers"] as const;
export const nodePropertyTypes = [
  "asyncOptions",
  "asyncMultiOptions",
  "options",
  "multiOptions",
  "string",
  "number",
  "positiveNumber",
  "boolean",
  "password",
  "json",
  "jsonSchema",
  "date",
  "file",
  "array",
  "propertyCollection",
  "asyncPropertyCollection",
  "credential",
  "asyncCredential",
  "section",
  "grid",
] as const;
