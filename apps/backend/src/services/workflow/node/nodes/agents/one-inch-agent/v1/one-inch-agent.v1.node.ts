import type {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../../types.js";
import { NodeCredentialNames, NodeVersionDescription } from "common";
import { NodePropertyOption } from "common/dist/workflow/types.js";
import { nodePropertyInputSchema } from "./schemas.js";
import {
  handleNodeExecutionError,
  validateNodePropertyInputSchema,
} from "../../../../utils.js";
import { getContextFromParentAgentNodes } from "../../../../../execution-engine/utils.js";
import { ToolNames } from "./types.js";
import { oneInchToolFactories, toolOptions } from "./tool/index.js";
import { OneInchToolsContext } from "./tool/types.js";
import { supportedNetworks } from "../../../../../../blockchain/platform/oneinch/constants.js";
import { SupportedNetworks } from "../../../../../../blockchain/platform/oneinch/types.js";
import { getAgentConfigurationsNodeProperty } from "../../../../properties/agent/agent.config.property.js";
import { evmWeb3WalletProperties } from "../../../../properties/web3.wallet.properties.js";
import { AgentOutputs } from "../../../../../../ai/agent/types.js";
import {
  createAgentFromNodeInputs,
  processAgenRunResultForNode,
  runAgent,
} from "../../../../../../ai/agent/agent.js";
import { creatNodeAgentMemoryManager } from "../../../../../../ai/agent/memory/node.memory.js";
import { initAgentTools } from "../../../../../../ai/agent/tool/utils.js";
import { toolNames } from "./constants.js";
import { validateCredential } from "../../../../../../credentials/crud/util.js";
import {
  RPCCredentialsData,
  rpcCredentialsSchema,
} from "../../../../../../credentials/credentials/rpc-credentials/schemas.js";
import {
  EVMPrivateKeyCredentialsData,
  evmPrivateKeyCredentialsSchema,
} from "../../../../../../credentials/credentials/evm-pk-credentials/schemas.js";
import {
  OneInchAICredentialsData,
  oneInchAICredentialsSchema,
} from "../../../../../../credentials/credentials/oneinch-credentials/schemas.js";

export class OneInchAgentV1Node implements INodeVersion {
  description: NodeVersionDescription;

  constructor() {
    this.description = {
      version: 1,
      properties: [
        getAgentConfigurationsNodeProperty({
          disableStreamingProperty: true, //Disable streaming to capture tool calls. TODO: How about hybrid approach?
          disableMaxTokensProperty: true, // Disable max tokens to get full output from the agent
        }),
        {
          label: "1Inch Configurations",
          name: "oneinch_configurations",
          type: "section",
          collection: [
            {
              type: "credential",
              label: "1Inch Credentials",
              name: "oneinch_credentials" satisfies NodeCredentialNames,
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
              description:
                "Select the tools that need approval before execution.",
              options: toolOptions,
              default: [
                "oneinch_swap_tool",
                "oneinch_create_limit_order_tool",
                "oneinch_cancel_limit_order_tool",
              ] satisfies ToolNames[],
            },
            {
              name: "networks",
              label: "Networks",
              type: "multiOptions",
              description: "Select the networks to enable for this agent.",
              options: [
                ...Array.from(supportedNetworks.entries()).map(
                  ([name, label]) => {
                    return {
                      name,
                      label,
                    } satisfies NodePropertyOption;
                  },
                ),
              ],
              default: [
                "base",
                "mainnet",
                "optimism",
                "arbitrum",
              ] satisfies SupportedNetworks[],
            },
          ],
        },
        evmWeb3WalletProperties,
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
    db,
  }: NodeExecutionInput): Promise<NodeExecutionOutput<AgentOutputs>> {
    try {
      const userMessage = trigger.data["userMessage"] as string | undefined;

      const validatedInputs = validateNodePropertyInputSchema({
        schema: nodePropertyInputSchema,
        inputs,
      });

      const agentConfigurations = validatedInputs.agent_configurations;

      // agentConfigurations = {
      //   ...agentConfigurations,
      //   [agentConfigurations.model_provider]: {
      //     ...agentConfigurations[agentConfigurations.model_provider],
      //     streaming: false,
      //   },
      // };

      const agent = createAgentFromNodeInputs<OneInchToolsContext>({
        nodeId: id,
        credentials: credentials || [],
        configurations: agentConfigurations,
        tools: initAgentTools<ToolNames, OneInchToolsContext>({
          toolsList: Array.from(toolNames.values()),
          selectedToolsList: validatedInputs.oneinch_configurations.tools || [],
          toolsNeedsApproval:
            validatedInputs.oneinch_configurations.toolsNeedApproval || [],
          toolFactories: oneInchToolFactories,
        }),
        toolChoice: "required",
      });

      const nodeMemoryManager = creatNodeAgentMemoryManager({
        nodeId: id,
        workflowId,
        sessionId,
        db,
      });

      const rpcCredentials = validateCredential<RPCCredentialsData>({
        credential: credentials?.find(
          (c) => c.credentialName === "rpc_credentials",
        ),
        schema: rpcCredentialsSchema,
      });

      const privateKeyCredentials =
        validateCredential<EVMPrivateKeyCredentialsData>({
          credential: credentials?.find(
            (c) => c.credentialName === "evm_pk_credentials",
          ),
          schema: evmPrivateKeyCredentialsSchema,
        });

      const oneInchCredentials = validateCredential<OneInchAICredentialsData>({
        credential: credentials?.find(
          (c) => c.credentialName === "oneinch_credentials",
        ),
        schema: oneInchAICredentialsSchema,
      });

      const runResult = await runAgent({
        agent,
        memoryManager: nodeMemoryManager,
        input: [
          ...getContextFromParentAgentNodes(parentNodeOutputs),
          {
            role: "user",
            content:
              `${agent.configs?.inputMessage || ""} ${userMessage || ""}`.trim(),
          },
        ],
        toolApprovalResults,
        context: {
          oneInchApiKey: oneInchCredentials?.data.api_key,
          rpcProvider: rpcCredentials && {
            provider: rpcCredentials?.data.rpc_provider,
            apiKey: rpcCredentials?.data.api_key,
            quickNodeEndpointName: rpcCredentials?.data.quicknode_endpoint_name,
          },
          evmPrivateKey: privateKeyCredentials?.data.private_key,
          enabledNetworks: validatedInputs.oneinch_configurations.networks,
        },
      });

      const { finalOutput, structuredOutput, artifacts } =
        await processAgenRunResultForNode({
          agent,
          runResult,
          nodeId: id,
          workflowId,
          sessionId,
          executionId,
          triggerName: trigger.name,
          memoryManager: nodeMemoryManager,
          toolIcon: "one-inch-logo.png",
        });

      return {
        nodeId: id,
        friendlyName,
        chatMessageId,
        success: true,
        outputs: {
          type: "agent",
          finalOutput,
          structuredOutput,
          artifacts,
        },
      } satisfies NodeExecutionOutput<AgentOutputs>;
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
