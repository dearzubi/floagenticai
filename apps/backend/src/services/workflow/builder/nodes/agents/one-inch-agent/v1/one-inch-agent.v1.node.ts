import type {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../types.js";
import { modelProviders } from "../../agent/model-providers/index.js";
import { NodeVersionDescription } from "common";
import {
  NodeProperty,
  NodePropertyOption,
} from "common/dist/workflow/types.js";
import { credentialsSchema, inputSchema } from "./schemas.js";
import { outputSchema, OutputsShape } from "../../agent/v1/schemas.js";
import {
  Agent,
  AgentInputItem,
  RunState,
  RunToolApprovalItem,
} from "@openai/agents";
import { z } from "zod/v4";
import {
  buildAgentInputs,
  extractFunctionToolApprovalsFromAgentInterruptions,
  extractFunctionToolCallsFromAgentResults,
  getAgentModel,
  getAgentRunner,
  getAgentStringifiedFinalOutput,
  getAPIKey as getModelAPIKey,
  getHistoryFromAgentMemory,
  getModelSettings,
  getStateFromAgentMemory,
  updateAgentMemory,
} from "../../agent/v1/utils.js";
import {
  handleNodeExecutionError,
  validateNodeExecutionSchema,
} from "../../../utils.js";
import { publishWorkflowNodeExecutionEvent } from "../../../../../execution-engine/utils.js";
import { ToolNames } from "./types.js";
import { GENERIC_AGENT_INSTRUCTIONS } from "../../agent/v1/constants.js";
import { toolOptions } from "./tools/index.js";
import { OneInchToolsContext } from "./tools/types.js";
import { supportedNetworks } from "../../../../../../blockchain/platform/oneinch/constants.js";
import { SupportedNetworks } from "../../../../../../blockchain/platform/oneinch/types.js";
import { WalletTypes } from "../../../../../../blockchain/wallet/types.js";
import { getSelectedOneInchTools } from "./utils.js";

export class OneInchAgentV1Node implements INodeVersion {
  description: NodeVersionDescription;

  constructor() {
    this.description = {
      version: 1,
      outputsShape: z.toJSONSchema(outputSchema),
      properties: [
        {
          type: "credential",
          label: "1Inch Credentials",
          name: "oneinch_credentials",
        },
        {
          name: "model_provider",
          label: "Model Provider",
          type: "options",
          options: modelProviders.map((provider) => {
            return {
              name: provider.name,
              label: provider.label,
              icon: provider.icon,
            } satisfies NodePropertyOption;
          }),
          default: modelProviders[0]?.name,
        },
        ...modelProviders.map((provider) => {
          return {
            label: `${provider.label} Model Settings`,
            name: `${provider.name}_model_settings`,
            type: "propertyCollection",
            collection: provider.modelSettings.filter(
              (setting) =>
                !["streaming", "additional_parameters"].includes(setting.name),
            ),
            embeddedCredentials:
              provider.name === "openai"
                ? [
                    {
                      label: "OpenAI Credentials",
                      name: "open_ai_credentials",
                    },
                  ]
                : provider.name === "google_gen_ai"
                  ? [
                      {
                        label: "GoogleAI Credentials",
                        name: "google_ai_credentials",
                      },
                    ]
                  : undefined,
            optional: true,
            displayOptions: {
              show: {
                model_provider: [provider.name],
              },
            },
          } satisfies NodeProperty;
        }),
        {
          name: "instructions",
          label: "Instructions",
          type: "string",
          description:
            "Instructions for how the router should evaluate conditions.",
          optional: true,
          isMultiline: true,
        },
        {
          name: "enable_memory",
          label: "Enable Memory",
          type: "boolean",
          optional: true,
          default: true,
          description:
            "Whether agent should remember conversation history or not.",
        },
        {
          name: "networks",
          label: "Networks",
          type: "multiOptions",
          description: "Select the networks to enable for this agent.",
          options: [
            ...Array.from(supportedNetworks.entries()).map(([name, label]) => {
              return {
                name,
                label,
              } satisfies NodePropertyOption;
            }),
          ],
          default: [
            "base",
            "mainnet",
            "optimism",
            "arbitrum",
          ] satisfies SupportedNetworks[],
        },
        {
          name: "tools",
          label: "Tools",
          type: "multiOptions",
          description: "Select the tools to enable for this agent.",
          options: toolOptions,
          default: [
            "oneinch_quotation_tool",
            "oneinch_swap_tool",
            "oneinch_create_limit_order_tool",
            "oneinch_get_limit_order_tool",
            "oneinch_cancel_limit_order_tool",
            "oneinch_get_address_limit_orders_tool",
          ] satisfies ToolNames[],
        },
        {
          name: "toolsNeedApproval",
          label: "Tools Need Approval",
          type: "multiOptions",
          description: "Select the tools that need approval before execution.",
          options: toolOptions,
          default: [
            "oneinch_swap_tool",
            "oneinch_create_limit_order_tool",
            "oneinch_cancel_limit_order_tool",
          ] satisfies ToolNames[],
        },
        {
          name: "wallet",
          label: "Wallet",
          type: "propertyCollection",
          collection: [
            {
              name: "wallet_type",
              label: "Wallet Type",
              type: "options",
              options: [
                {
                  name: "private_key_wallet",
                  label: "Private Key Wallet",
                },
                {
                  name: "custodial_wallet", // TODO: show this to only admin users
                  label: "Custodial Wallet",
                },
              ],
              default: "private_key_wallet" as WalletTypes,
            },
            {
              name: "evm_pk_credentials",
              label: "EVM Private Key Credentials",
              type: "credential",
              displayOptions: {
                show: {
                  "wallet.wallet_type": ["private_key_wallet"],
                },
              },
            },
            {
              type: "credential",
              label: "RPC Credentials",
              name: "rpc_credentials",
              optional: true,
            },
          ],
        },
      ],
    };
  }

  async execute({
    id,
    inputs,
    credentials,
    parentNodeOutputs,
    trigger,
    workflowId,
    executionId,
    friendlyName,
    sessionId,
    toolApprovalResults,
    chatMessageId,
  }: NodeExecutionInput): Promise<NodeExecutionOutput<OutputsShape>> {
    let finalOutput: string | undefined;
    let updatedState: Record<string, unknown>;
    let updatedHistory: AgentInputItem[];

    try {
      const validatedInputs = validateNodeExecutionSchema({
        schema: inputSchema,
        data: inputs,
        nodeId: id,
        errorMessage: "Please provide required and valid inputs",
        workflowId,
        executionId,
      });

      const validatedCredentials = validateNodeExecutionSchema({
        schema: credentialsSchema,
        data: credentials,
        nodeId: id,
        errorMessage: "Please provide all the required credentials",
        workflowId,
        executionId,
      });

      const compatibleInputs = {
        ...validatedInputs,
        input_message: "", // No input message needed
        output_structure: undefined,
      };

      const userMessage = trigger.data["userMessage"] as string | undefined;

      const apiKey = await getModelAPIKey(
        compatibleInputs,
        validatedCredentials.filter(
          (c) =>
            c.name === "open_ai_credentials" ||
            c.name === "google_ai_credentials",
        ),
      );

      const memoryEnabled = validatedInputs.enable_memory ?? true;

      const memoryHistory: AgentInputItem[] = [];

      if (memoryEnabled) {
        memoryHistory.push(
          ...(await getHistoryFromAgentMemory({
            workflowId,
            nodeId: id,
            sessionId,
          })),
        );
      }

      const agentInput = buildAgentInputs({
        history: memoryHistory,
        parentNodeOutputs,
        userMessage,
      });

      const model = getAgentModel(compatibleInputs, apiKey);
      const runner = getAgentRunner(compatibleInputs, apiKey);
      const modelSettings = getModelSettings(compatibleInputs);
      const selectedTools = getSelectedOneInchTools(validatedInputs);

      const agent = new Agent<OneInchToolsContext>({
        name: id,
        instructions: `${GENERIC_AGENT_INSTRUCTIONS}\n${validatedInputs.instructions || ""}`,
        model,
        modelSettings: {
          ...modelSettings,
          maxTokens: undefined, // Intentionally undefined to get full output
          toolChoice: "required",
        },
        tools: selectedTools,
      });

      let state: RunState<OneInchToolsContext, typeof agent> | undefined =
        undefined;

      if (toolApprovalResults) {
        const memoryState = await getStateFromAgentMemory({
          workflowId,
          nodeId: id,
          sessionId,
        });

        if (memoryState) {
          state = await RunState.fromString(agent, memoryState);

          for (const approvalResult of toolApprovalResults) {
            const { nodeId: _, actionStatus, ...rest } = approvalResult;
            const runApprovalItem = new RunToolApprovalItem(rest, agent);
            if (actionStatus === "approved") {
              state.approve(runApprovalItem);
            } else {
              state.reject(runApprovalItem);
            }
          }
        }
      }

      const rpcCredentials = validatedCredentials.find(
        (c) => c.name === "rpc_credentials",
      );

      const privateKeyCredentials = validatedCredentials.find(
        (c) => c.name === "evm_pk_credentials",
      );

      const oneInchCredentials = validatedCredentials.find(
        (credential) => credential.name === "oneinch_credentials",
      );

      const result = await runner.run<typeof agent, OneInchToolsContext>(
        agent,
        state ? state : agentInput,
        {
          stream: false,
          context: {
            oneInchApiKey: oneInchCredentials?.data.api_key,
            rpcProvider: rpcCredentials && {
              provider: rpcCredentials?.data.rpc_provider,
              apiKey: rpcCredentials?.data.api_key,
              quickNodeEndpointName:
                rpcCredentials?.data.quicknode_endpoint_name,
            },
            evmPrivateKey: privateKeyCredentials?.data.private_key,
            enabledNetworks: validatedInputs.networks,
          },
        },
      );

      const interruptions = result.interruptions;

      finalOutput =
        interruptions.length > 0
          ? ""
          : getAgentStringifiedFinalOutput(result.finalOutput);
      updatedState = result.state.toJSON();
      updatedHistory = result.history;

      const toolCallItems = extractFunctionToolCallsFromAgentResults(
        result.newItems,
      ).map((item) => {
        return {
          ...item,
          toolIcon: "one-inch-logo.png",
        };
      });

      const toolApprovalItems =
        extractFunctionToolApprovalsFromAgentInterruptions(id, interruptions);

      await publishWorkflowNodeExecutionEvent({
        type: "responded",
        sessionId,
        workflowId,
        executionId,
        triggerName: trigger.name,
        nodeId: id,
        data: {
          content: finalOutput || "",
          artifacts: {
            agentToolCalls: toolCallItems,
            agentToolApprovals: toolApprovalItems,
          },
        },
      });

      if (memoryEnabled) {
        await updateAgentMemory({
          sessionId,
          workflowId,
          nodeId: id,
          history: updatedHistory,
          state: updatedState,
        });
      }

      return {
        nodeId: id,
        friendlyName,
        chatMessageId,
        success: true,
        outputs: {
          finalOutput: finalOutput || "",
          artifacts: {
            agentToolCalls: toolCallItems,
            agentToolApprovals: toolApprovalItems,
          },
        },
      } satisfies NodeExecutionOutput;
    } catch (error) {
      return await handleNodeExecutionError({
        nodeId: id,
        workflowId,
        executionId,
        error,
        sessionId,
        triggerName: trigger.name,
        chatMessageId,
      });
    }
  }
}
