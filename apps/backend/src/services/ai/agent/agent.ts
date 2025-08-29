import {
  AgentOutputType,
  UnknownContext,
  TextOutput,
  AgentInputItem,
  Runner,
  StreamedRunResult,
  Agent as OpenAIAgent,
  Tool,
  ModelSettingsToolChoice,
  RunState,
  RunToolApprovalItem,
  AssistantMessageItem,
  MCPServer,
  createMCPToolStaticFilter,
} from "@openai/agents";
import { AiSdkModel } from "@openai/agents-extensions";
import { ZodType } from "zod";
import {
  AgentToolApprovalItem,
  AgentToolCallItem,
  convertJsonSchemaToZodSchema,
  ModelProviders,
  TriggerNodeNames,
} from "common";
import { CredentialData } from "../../credentials/crud/types.js";
import { chatModelFactories } from "../llm/provider/index.js";
import { AgentConfigurationsPropertyInput } from "../../workflow/node/property/properties/agent/agent.config.property.js";
import { AgentMemoryManager } from "./memory/types.js";
import { AgentOutputs, CreateAgentOptions } from "./types.js";
import { publishWorkflowNodeExecutionEvent } from "../../workflow/execution-engine/utils.js";
import { safeParseJSON } from "common";
import { ZodObject } from "zod/v3";
import { DB } from "../../../database/init.js";
import { getUserMCPInstallations } from "../mcp/crud/index.js";
import { processCredential } from "../../credentials/crud/util.js";
import { Credential } from "../../../database/entities/credential.entity.js";
import { mcpServers } from "../mcp/servers/index.js";
import { IMCPServer } from "../mcp/types.js";

const GENERIC_AGENT_INSTRUCTIONS =
  "You are an AI agent in the chain of multiple AI agents. When answering, make sure to minimise duplicate information from the previous agents (if available) in your response.\n";

class Agent<
  TContext = UnknownContext,
  TOutput extends AgentOutputType = TextOutput,
> extends OpenAIAgent<TContext, TOutput> {
  configs?: {
    inputMessage?: string;
    enableMemory?: boolean;
    enableStreaming?: boolean;
  };
}

/**
 * Creates an OpenAI Agent instance with the provided options.
 * @param options
 */
const createAgent = <
  TContext = UnknownContext,
  TOutput extends AgentOutputType = TextOutput,
>(
  options: CreateAgentOptions<TContext>,
): Agent<TContext, TOutput> => {
  const isStructuredOutputDefined = (
    outputType?: AgentOutputType,
  ): outputType is Exclude<AgentOutputType, TextOutput> => {
    return (
      typeof outputType !== "string" &&
      outputType !== null &&
      outputType !== undefined
    );
  };

  const getModel = (): AiSdkModel => {
    if (typeof options.model.model !== "string") {
      return options.model.model;
    }

    if (!options.model.provider) {
      throw new Error("Please select a valid model provider.");
    }

    const model = chatModelFactories.get(options.model.provider.name)?.({
      modelName: options.model.model,
      credential: options.model.provider.credential,
    });

    if (!model) {
      throw new Error(
        `Model ${options.model.model} not found for provider ${options.model.provider.name}.`,
      );
    }

    return model;
  };

  const finalOutputType = (
    isStructuredOutputDefined(options.outputType)
      ? options.outputType
      : ("text" as TextOutput)
  ) as TOutput;

  const agent = new Agent<TContext, TOutput>({
    name: options.name,
    instructions: `${GENERIC_AGENT_INSTRUCTIONS}${options.instructions || ""}`,
    model: getModel(),
    modelSettings: {
      ...options.model.settings,
      maxTokens:
        options.outputType instanceof ZodType
          ? undefined
          : options.model.settings?.maxTokens, // Remove max tokens limit if output structure is defined to ensure that the output is valid json
      // parallelToolCalls:
      //   validatedInputs.openai_model_settings?.additional_parameters
      //     ?.parallel_tool_calls, // TODO: Come back to parallel tool calls later
    },
    outputType: finalOutputType,
    tools: options.tools,
    mcpServers: options.mcpServers,
  });

  agent.configs = {
    enableMemory: options.model.settings?.enableMemory ?? false,
    enableStreaming: options.model.settings?.enableStreaming ?? false,
    inputMessage: options.inputMessage,
  };

  return agent;
};

/**
 * Creates an OpenAI Agent instance from workflow node inputs.
 * @param nodeId
 * @param inputs
 * @param credentials
 * @param tools
 * @param toolChoice
 * @param db
 * @param userId
 */
const createAgentFromNodeInputs = async <
  TContext = UnknownContext,
  TOutput extends AgentOutputType = TextOutput,
>({
  nodeId,
  credentials,
  inputs,
  tools,
  toolChoice,
  db,
  userId,
}: {
  nodeId: string;
  credentials: CredentialData[];
  inputs: AgentConfigurationsPropertyInput;
  tools?: Tool<TContext>[];
  toolChoice?: ModelSettingsToolChoice | undefined;
  db?: DB;
  userId?: string;
}): Promise<Agent<TContext, TOutput>> => {
  const configurations = inputs.agent_configurations.llm_configurations;

  const getOutputStructure = () => {
    if (configurations.output_structure instanceof ZodObject) {
      return configurations.output_structure as AgentOutputType;
    }

    if (
      typeof configurations.output_structure === "object" &&
      configurations.output_structure !== null
    ) {
      return convertJsonSchemaToZodSchema(
        configurations.output_structure,
      ) as AgentOutputType;
    }

    return "text";
  };

  const initMCPServers = async (): Promise<MCPServer[]> => {
    const selectedMCPServers =
      inputs.agent_configurations.mcp_configurations?.mcp_installations || [];
    if (selectedMCPServers.length === 0 || !db || !userId) {
      return [];
    }

    return await Promise.all(
      (
        await getUserMCPInstallations({
          db,
          userId,
          withCredentialEncryptedData: true as const,
        })
      )
        .filter(
          (installation) =>
            installation.status === "enabled" &&
            selectedMCPServers.includes(installation.id) &&
            mcpServers.has(installation.mcpServerName),
        )
        .map(async (installation) => {
          let credentialData: CredentialData | undefined;
          if (installation.credential) {
            credentialData = processCredential(
              installation.credential as Credential,
              true,
              true,
            ) as CredentialData;
          }

          const mcpServerFactory = mcpServers.get(
            installation.mcpServerName,
          ) as IMCPServer;

          return await mcpServerFactory.initServer({
            credential: credentialData,
            toolFilter: createMCPToolStaticFilter({
              allowed: installation.selectedTools,
            }),
          });
        }),
    );
  };

  return createAgent({
    name: nodeId,
    model: {
      model:
        (configurations.model_provider === "openrouter"
          ? configurations.modelName
          : configurations.model) || "",
      settings: {
        ...configurations.advanced_settings,
        toolChoice,
        enableMemory: configurations.enable_memory,
        enableStreaming: configurations.advanced_settings?.streaming,
      },
      provider: {
        name: configurations.model_provider as ModelProviders,
        credential:
          credentials.find(
            (c) => c.credentialName === configurations.model_provider,
          ) ?? "",
      },
    },
    instructions: configurations.instructions,
    outputType: getOutputStructure(),
    tools,
    mcpServers: await initMCPServers(),
  });
};

/**
 * Runs an OpenAI Agent with the provided input and options.
 * @param agent
 * @param input
 * @param memoryManager
 * @param toolApprovalResults
 * @param context
 */
const runAgent = async <
  TContext = UnknownContext,
  TOutput extends AgentOutputType = TextOutput,
>({
  agent,
  input,
  memoryManager,
  toolApprovalResults,
  context,
}: {
  agent: Agent<TContext, TOutput>;
  input: string | AgentInputItem | AgentInputItem[];
  memoryManager?: AgentMemoryManager;
  toolApprovalResults?: AgentToolApprovalItem[];
  context?: TContext;
}): Promise<StreamedRunResult<TContext, OpenAIAgent<any, any>>> => {
  const getState = async (): Promise<
    RunState<TContext, typeof agent> | undefined
  > => {
    if (!toolApprovalResults || !memoryManager) {
      return;
    }

    const memoryState = await memoryManager.getState();

    if (!memoryState) {
      return;
    }

    const state = await RunState.fromString<TContext, typeof agent>(
      agent,
      memoryState,
    );

    for (const approvalResult of toolApprovalResults) {
      const { nodeId: _, actionStatus, ...rest } = approvalResult;
      const runApprovalItem = new RunToolApprovalItem(rest, agent);
      if (actionStatus === "approved") {
        state.approve(runApprovalItem);
      } else {
        state.reject(runApprovalItem);
      }
    }

    return state;
  };

  const modelInput: AgentInputItem[] = [];

  if (agent.configs?.enableMemory && memoryManager) {
    modelInput.push(...(await memoryManager.getHistory()));
  }

  if (Array.isArray(input)) {
    modelInput.push(...input);
  } else if (typeof input === "string") {
    modelInput.push({ role: "user", content: input });
  } else {
    modelInput.push(input);
  }

  const runner = new Runner();

  const state = await getState();

  return await runner.run(agent, state ? state : modelInput, {
    stream: (agent.configs?.enableStreaming === true &&
      agent.outputType === "text") as true,
    context,
  });
};

const processAgenRunResultForNode = async <
  TContext = UnknownContext,
  TOutput extends AgentOutputType = TextOutput,
  SOutput extends Record<string, unknown> = Record<string, unknown>,
>({
  agent,
  runResult,
  nodeId,
  workflowId,
  sessionId,
  executionId,
  triggerName,
  memoryManager,
  toolIcon,
  disableEventPublishing,
  agentInput,
}: {
  agent: Agent<TContext, TOutput>;
  //@eslint-disable-next-line @typescript-eslint/no-explicit-any
  runResult: StreamedRunResult<TContext, OpenAIAgent<any, any>>;
  nodeId: string;
  workflowId: string;
  sessionId: string;
  executionId: string;
  triggerName: TriggerNodeNames;
  memoryManager?: AgentMemoryManager;
  toolIcon?: string;
  disableEventPublishing?: boolean;
  agentInput?: AgentInputItem[];
}): Promise<AgentOutputs<SOutput>> => {
  const processStream = async () => {
    if (disableEventPublishing) {
      return;
    }
    const textStream = runResult.toTextStream({
      compatibleWithNodeStreams: true,
    });

    try {
      for await (const chunk of textStream) {
        try {
          const chunkString = chunk.toString();

          await publishWorkflowNodeExecutionEvent({
            type: "responded",
            sessionId,
            workflowId,
            executionId,
            triggerName,
            nodeId,
            data: {
              content: chunkString,
            },
          });
        } catch (chunkErr) {
          /* empty */
        }
      }
    } catch (streamErr) {
      /* empty */
    }

    await runResult.completed;
  };

  const getAgentFinalOutput = (): string => {
    const finalOutput = runResult.finalOutput;

    if (!finalOutput) {
      return "";
    }

    if (typeof finalOutput === "string") {
      return finalOutput;
    }

    return "```json\n" + JSON.stringify(finalOutput, null, 2) + "\n```";
  };

  const getAgentStructuredOutput = (): SOutput | undefined => {
    const finalOutput = runResult.finalOutput;

    if (typeof finalOutput === "object" && finalOutput !== null) {
      return finalOutput as Record<string, unknown> as SOutput;
    }
    return undefined;
  };

  const extractFunctionToolCallsFromAgentResults = (): AgentToolCallItem[] => {
    const toolCallItems = new Map<string, AgentToolCallItem>();

    runResult.newItems.forEach((item) => {
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
          toolIcon: toolIcon,
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
            toolIcon: toolIcon,
          });
        }
      }
    });

    return Array.from(toolCallItems.values());
  };

  const extractFunctionToolApprovalsFromAgentInterruptions =
    (): AgentToolApprovalItem[] => {
      const toolApprovalItems = new Map<string, AgentToolApprovalItem>();

      runResult.interruptions.forEach((item) => {
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

  const getAgentContextToForwardString = (): string | undefined => {
    if (!agentInput) {
      return;
    }
    return agentInput
      .filter((item) => (item as AssistantMessageItem).role === "assistant")
      .flatMap((item) =>
        (item as AssistantMessageItem).content.map((c) => {
          if (c.type === "output_text") {
            return c.text;
          }
          return "";
        }),
      )
      .filter((item) => item.length > 0)
      .join("\n");
  };

  if (typeof runResult.toTextStream !== "undefined") {
    await processStream();
  }

  const finalOutput = getAgentFinalOutput();
  const structuredOutput = getAgentStructuredOutput();

  const updatedState = runResult.state.toJSON();
  const updatedHistory = runResult.history;
  const forwardedContext = getAgentContextToForwardString();

  const interruptions = runResult.interruptions;

  const agentToolCalls = extractFunctionToolCallsFromAgentResults();
  const agentToolApprovals =
    extractFunctionToolApprovalsFromAgentInterruptions();

  await Promise.all([
    !disableEventPublishing
      ? publishWorkflowNodeExecutionEvent({
          type: "responded",
          sessionId,
          workflowId,
          executionId,
          triggerName,
          nodeId,
          data: {
            content: !runResult.toTextStream ? finalOutput : "",
            artifacts: {
              agentToolCalls,
              agentToolApprovals,
            },
          },
        })
      : Promise.resolve(),
    agent.configs?.enableMemory && memoryManager
      ? memoryManager.updateMemory(updatedHistory, updatedState)
      : Promise.resolve(),
  ]);

  return {
    type: "agent",
    finalOutput: interruptions.length === 0 ? finalOutput : "",
    structuredOutput,
    forwardedContext,
    artifacts: {
      agentToolCalls,
      agentToolApprovals,
    },
  } satisfies AgentOutputs<SOutput>;
};

export {
  Agent,
  createAgent,
  createAgentFromNodeInputs,
  runAgent,
  processAgenRunResultForNode,
};
