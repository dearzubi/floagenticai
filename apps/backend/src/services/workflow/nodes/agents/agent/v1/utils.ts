import { NodeExecutionInput } from "../../../types.js";
import {
  AgentToolApprovalItem,
  AgentToolCallItem,
  extractNodeNameFromNodeId,
} from "common";
import {
  AgentInputItem,
  Model,
  ModelSettings,
  OpenAIProvider,
  RunItem,
  Runner,
  RunToolApprovalItem,
} from "@openai/agents";
import { credentialsSchema, inputSchema, OutputsShape } from "./schemas.js";
import { OutputsShape as RouterAgentOutputsShape } from "../../router-agent/v1/schemas.js";
import { getDB } from "../../../../../../database/init.js";
import { AgentMemory } from "../../../../../../database/entities/agent-memory.entity.js";
import { safeParseJSON } from "../../../../../../utils/misc.js";
import {
  decryptData,
  encryptData,
} from "../../../../../../utils/encryption.js";
import { z } from "zod/v4";
import { z as zodv3, ZodTypeAny } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { aisdk } from "@openai/agents-extensions";

type GoogleGenerativeAIModelId = Parameters<
  ReturnType<typeof createGoogleGenerativeAI>
>["0"];

/**
 * Extract context information from parent agent nodes outputs
 * @param parentNodeOutputs - The outputs of the parent agent nodes
 */
export const getContextFromParentAgentNodes = (
  parentNodeOutputs: NodeExecutionInput["parentNodeOutputs"],
): AgentInputItem[] => {
  const agentInput: AgentInputItem[] = [];

  if (!parentNodeOutputs) {
    return agentInput;
  }

  for (const [nodeId, nodeOutput] of parentNodeOutputs) {
    if (!nodeOutput.success) {
      continue;
    }
    const nodeName = extractNodeNameFromNodeId(nodeId);

    let text: string | undefined;

    if (nodeName === "agent") {
      text = `Agent "${nodeOutput.friendlyName}": ${(nodeOutput.outputs as OutputsShape).finalOutput}`;
    } else if (nodeName === "router_agent") {
      text = (nodeOutput.outputs as RouterAgentOutputsShape).contextToForward;
    }

    if (!text) {
      continue;
    }
    agentInput.push({
      role: "assistant",
      status: "completed",
      content: [
        {
          text: text,
          type: "output_text",
        },
      ],
    });
  }

  return agentInput;
};

/**
 * Builds the input for an agent node based on the node's input message, history and
 * the outputs of its parent nodes.
 *
 * @param {AgentInputItem[]} history - The history of messages for the agent
 * @param {string | null} inputMessage - The input message for the agent
 * @param {NodeExecutionInput["parentNodeOutputs"]} parentNodeOutputs - The
 * outputs of the agent's parent nodes
 *
 * @param {string} userMessage - The original user message sent in the chat
 * @returns {AgentInputItem[]} The input for the agent node
 */

export const buildAgentInputs = ({
  history,
  inputMessage,
  parentNodeOutputs,
  userMessage,
}: {
  history?: AgentInputItem[];
  inputMessage?: string | null;
  parentNodeOutputs?: NodeExecutionInput["parentNodeOutputs"];
  userMessage?: string | null;
}): AgentInputItem[] => {
  const agentInput: AgentInputItem[] = [...(history || [])];

  agentInput.push(...getContextFromParentAgentNodes(parentNodeOutputs));

  agentInput.push({
    role: "user",
    content: `${inputMessage || ""} ${userMessage || ""}`.trim(),
  });

  return agentInput;
};

/**
 * Get Agent history from database memory
 * @param sessionId - A unique identifier for the session
 * @param workflowId - The ID of the workflow
 * @param nodeId - The ID of the nodes
 */
export const getHistoryFromAgentMemory = async ({
  sessionId,
  workflowId,
  nodeId,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
}): Promise<AgentInputItem[]> => {
  const db = await getDB();

  const dbMemory = await db.findOne(AgentMemory, {
    workflowId,
    nodeId,
    sessionId,
  });

  const decryptedData = decryptData(dbMemory?.history);

  return (
    safeParseJSON<AgentInputItem[]>(
      decryptedData.ok ? decryptedData.plainText : "[]",
    ) || []
  );
};

/**
 * Get Agent state from database memory
 * @param sessionId - A unique identifier for the session
 * @param workflowId - The ID of the workflow
 * @param nodeId - The ID of the nodes
 */
export const getStateFromAgentMemory = async ({
  sessionId,
  workflowId,
  nodeId,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
}): Promise<string | undefined> => {
  const db = await getDB();

  const dbMemory = await db.findOne(AgentMemory, {
    workflowId,
    nodeId,
    sessionId,
  });

  const decryptedData = decryptData(dbMemory?.state);

  return decryptedData?.ok ? decryptedData.plainText : undefined;
};

/**
 * Update Agent memory in database
 * @param sessionId - A unique identifier for the session
 * @param workflowId - The ID of the workflow
 * @param nodeId - The ID of the nodes
 * @param history - The updated history of the agent
 * @param state - The updated state of the agent
 */
export const updateAgentMemory = async ({
  sessionId,
  workflowId,
  nodeId,
  history,
  state,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
  history: AgentInputItem[];
  state: Record<string, unknown>;
}): Promise<void> => {
  const db = await getDB();

  const memory = db.create(AgentMemory, {
    sessionId,
    workflowId,
    nodeId,
    history: encryptData(JSON.stringify(history)),
    state: encryptData(JSON.stringify(state)),
  });

  await db.upsert(AgentMemory, memory);

  await db.flush();
};

/**
 * Get API key for selected model provider from the credentials
 * @param validatedInputs
 * @param validatedCredentials
 */
export const getAPIKey = async (
  validatedInputs: z.infer<typeof inputSchema>,
  validatedCredentials: z.infer<typeof credentialsSchema>,
): Promise<string> => {
  if (validatedInputs.model_provider === "openai") {
    const openAIKey = validatedCredentials.find(
      (credential) => credential.name === "open_ai_credentials",
    )?.data?.api_key;

    if (!openAIKey) {
      throw new Error("OpenAI API key required");
    }

    return openAIKey;
  } else if (validatedInputs.model_provider === "google_gen_ai") {
    const googleAIKey = validatedCredentials.find(
      (credential) => credential.name === "google_ai_credentials",
    )?.data?.api_key;

    if (!googleAIKey) {
      throw new Error("GoogleAI API key required");
    }

    return googleAIKey;
  }

  throw new Error(`API key required to use ${validatedInputs.model_provider}`);
};

/**
 * Check if streaming is enabled for selected model provider settings
 * @param validatedInputs
 */
export const isStreamingEnabled = (
  validatedInputs: z.infer<typeof inputSchema>,
): boolean => {
  if (validatedInputs.model_provider === "openai") {
    return validatedInputs.openai_model_settings?.streaming ?? false;
  } else if (validatedInputs.model_provider === "google_gen_ai") {
    return validatedInputs.google_gen_ai_model_settings?.streaming ?? false;
  }
  return false;
};

/**
 * Get Agent Runner for selected model provider
 * @param validatedInputs
 * @param apiKey
 */
export const getAgentRunner = (
  validatedInputs: z.infer<typeof inputSchema>,
  apiKey?: string,
): Runner => {
  if (validatedInputs.model_provider === "openai") {
    return new Runner({
      modelProvider: new OpenAIProvider({
        apiKey: apiKey,
      }),
    });
  }
  return new Runner();
};

/**
 * Get LLM Model for selected model provider
 * @param validatedInputs
 * @param apiKey
 */
export const getAgentModel = (
  validatedInputs: z.infer<typeof inputSchema>,
  apiKey?: string,
): string | Model | undefined => {
  if (validatedInputs.model_provider === "openai") {
    return validatedInputs.openai_model_settings?.model;
  } else if (validatedInputs.model_provider === "google_gen_ai") {
    const google = createGoogleGenerativeAI({
      apiKey,
    });
    return aisdk(
      google(
        validatedInputs.google_gen_ai_model_settings
          ?.model as GoogleGenerativeAIModelId,
      ),
    );
  }

  throw new Error(`No valid model found for ${validatedInputs.model_provider}`);
};

/**
 * Get model settings for selected model provider
 * @param validatedInputs
 */
export const getModelSettings = (
  validatedInputs: z.infer<typeof inputSchema>,
): ModelSettings => {
  if (validatedInputs.model_provider === "openai") {
    return {
      temperature: validatedInputs.openai_model_settings?.temperature,
      topP: validatedInputs.openai_model_settings?.additional_parameters
        ?.top_probability,
      maxTokens:
        validatedInputs.openai_model_settings?.additional_parameters
          ?.max_tokens,
      frequencyPenalty:
        validatedInputs.openai_model_settings?.additional_parameters
          ?.freq_penality,
      presencePenalty:
        validatedInputs.openai_model_settings?.additional_parameters
          ?.presence_penality,
    } satisfies ModelSettings;
  } else if (validatedInputs.model_provider === "google_gen_ai") {
    return {
      temperature: validatedInputs.google_gen_ai_model_settings?.temperature,
      topP: validatedInputs.google_gen_ai_model_settings?.additional_parameters
        ?.top_probability,
      maxTokens:
        validatedInputs.google_gen_ai_model_settings?.additional_parameters
          ?.max_tokens,
      frequencyPenalty:
        validatedInputs.google_gen_ai_model_settings?.additional_parameters
          ?.freq_penality,
      presencePenalty:
        validatedInputs.google_gen_ai_model_settings?.additional_parameters
          ?.presence_penality,
    } satisfies ModelSettings;
  }

  return {};
};

type Draft07Schema = {
  type?: string | string[];
  properties?: Record<string, Draft07Schema>;
  items?: Draft07Schema;
  required?: string[];
  enum?: unknown[];
  description?: string;
  [key: string]: unknown;
};

/**
 * Recursively converts a JSON-Schema Draft-07 subtree into an equivalent Zod
 * schema.
 *
 * Unsupported keywords default to `z.any()` so the generated schema will still
 * parse, albeit without full validation.
 */
export function convertJsonSchemaToZodSchema(
  schema: Draft07Schema,
): ZodTypeAny {
  const withDescription = (zod: ZodTypeAny): ZodTypeAny =>
    schema.description ? zod.describe(schema.description) : zod;

  if (Array.isArray(schema.enum)) {
    // z.enum() only accepts string literals; fall back if enums are heterogeneous
    const allStrings = schema.enum.every((v) => typeof v === "string");
    if (allStrings) {
      return withDescription(zodv3.enum(schema.enum as [string, ...string[]]));
    }
    return withDescription(
      zodv3.literal(schema.enum[0] as never).or(zodv3.any()),
    );
  }

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (type) {
    case "string":
      return withDescription(zodv3.string());
    case "number":
    case "integer": // treat integer as number + .int()
      return withDescription(
        type === "integer" ? zodv3.number().int() : zodv3.number(),
      );
    case "boolean":
      return withDescription(zodv3.boolean());
    case "null":
      return withDescription(zodv3.null());
    case "array": {
      const itemSchema = schema.items
        ? convertJsonSchemaToZodSchema(schema.items as Draft07Schema)
        : zodv3.any();
      return withDescription(zodv3.array(itemSchema));
    }
    case "object": {
      const props = schema.properties ?? {};

      const shape: Record<string, ZodTypeAny> = {};
      for (const [propName, propSchema] of Object.entries(props)) {
        shape[propName] = convertJsonSchemaToZodSchema(
          propSchema as Draft07Schema,
        );
      }
      return withDescription(zodv3.object(shape));
    }
    default:
      // unknown or missing `type`
      return withDescription(zodv3.any());
  }
}

/**
 * Convert agent's final output to string
 * @param finalOutput
 */
export const getAgentStringifiedFinalOutput = (
  finalOutput: unknown,
): string => {
  if (!finalOutput) {
    return "";
  }
  if (finalOutput && typeof finalOutput === "object") {
    return "```json\n" + JSON.stringify(finalOutput, null, 2) + "\n```";
  } else if (typeof finalOutput === "string") {
    return finalOutput;
  }
  return String(finalOutput);
};

/**
 * Get the structured output from agent's final output
 * @param finalOutput
 */
export const getAgentStructuredOutput = (
  finalOutput: unknown,
): Record<string, unknown> | undefined => {
  if (
    typeof finalOutput === "object" &&
    finalOutput !== null &&
    !Array.isArray(finalOutput)
  ) {
    return finalOutput as Record<string, unknown>;
  }
  return undefined;
};

/**
 * Extract function tool calls from agent results
 * @param items - Agent run items from the agent results
 */
export const extractFunctionToolCallsFromAgentResults = (
  items: RunItem[],
): AgentToolCallItem[] => {
  const toolCallItems = new Map<string, AgentToolCallItem>();

  items.forEach((item) => {
    if (item.type === "tool_call_item") {
      const rawItem = item.rawItem;
      if (rawItem.type !== "function_call") {
        return;
      }
      const toolArguments = safeParseJSON<Record<string, string>>(
        rawItem.arguments,
      );
      const toolCallItem: AgentToolCallItem = {
        toolName: rawItem.name,
        toolInput: toolArguments ? toolArguments : {},
        toolOutput: "",
      };

      toolCallItems.set(rawItem.name, toolCallItem);
    } else if (item.type === "tool_call_output_item") {
      const rawItem = item.rawItem;

      if (rawItem.type !== "function_call_result") {
        return;
      }

      const toolCallItem = toolCallItems.get(rawItem.name);
      const toolOutput =
        rawItem.output.type === "text" ? rawItem.output.text : "";
      if (toolCallItem) {
        toolCallItem.toolOutput = toolOutput;
      } else {
        toolCallItems.set(rawItem.name, {
          toolName: rawItem.name,
          toolInput: {},
          toolOutput: toolOutput,
        });
      }
    }
  });

  return Array.from(toolCallItems.values());
};

/**
 * Extract function tool approvals from agent interruptions
 * @param nodeId - The ID of the agent node
 * @param interruptions - Interruptions generated by the agent
 */
export const extractFunctionToolApprovalsFromAgentInterruptions = (
  nodeId: string,
  interruptions: RunToolApprovalItem[],
): AgentToolApprovalItem[] => {
  const toolApprovalItems = new Map<string, AgentToolApprovalItem>();

  interruptions.forEach((item) => {
    const rawItem = item.rawItem;
    if (rawItem.type !== "function_call") {
      return;
    }

    const toolApprovalItem: AgentToolApprovalItem = {
      ...rawItem,
      nodeId,
      actionStatus: "pending",
    };

    toolApprovalItems.set(rawItem.name, toolApprovalItem);
  });

  return Array.from(toolApprovalItems.values());
};
