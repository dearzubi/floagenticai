import type {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../../types.js";
import { NodeVersionDescription } from "common";
import {
  nodePropertyInputSchema,
  outputStructureSchema,
  RouterAgentOutputStructure,
} from "./schemas.js";
import {
  handleNodeExecutionError,
  validateNodePropertyInputSchema,
} from "../../../../utils.js";
import { buildRouterAgentInstructions, getSelectedCondition } from "./utils.js";
import {
  getContextFromParentAgentNodes,
  publishWorkflowNodeExecutionEvent,
} from "../../../../../execution-engine/utils.js";
import { getAgentConfigurationsNodeProperty } from "../../../../properties/agent/agent.config.property.js";
import {
  createAgentFromNodeInputs,
  processAgenRunResultForNode,
  runAgent,
} from "../../../../../../ai/agent/agent.js";
import { creatNodeAgentMemoryManager } from "../../../../../../ai/agent/memory/node.memory.js";
import { AgentOutputs } from "../../../../../../ai/agent/types.js";
import { AgentInputItem } from "@openai/agents";

export class RouterAgentV1Node implements INodeVersion {
  description: NodeVersionDescription;

  constructor() {
    this.description = {
      version: 1,
      properties: [
        getAgentConfigurationsNodeProperty({
          disableInstructionsProperty: true,
          disableInputMessageProperty: true,
          disableMemoryProperty: true,
          disableOutputStructureProperty: true,
          disableMaxTokensProperty: true,
          disableStreamingProperty: true,
        }),
        {
          label: "Router Configurations",
          name: "router_configurations",
          type: "section",
          collection: [
            {
              name: "conditions",
              label: "Routing Conditions",
              type: "array",
              description:
                "Add one or more routing conditions. The router will evaluate them in order and select the first matching condition.",
              collection: [
                {
                  name: "id",
                  label: "Condition ID",
                  type: "string",
                  description: "Unique identifier to represent output route.",
                },
                {
                  name: "name",
                  label: "Condition Name",
                  type: "string",
                  description: "Human-readable name for your reference.",
                },
                {
                  name: "expression",
                  label: "Condition Expression",
                  type: "string",
                  description: "Describe when should this condition be met.",
                  isMultiline: true,
                },
              ],
            },
            {
              name: "default_condition",
              label: "Default Condition ID",
              type: "string",
              optional: true,
              description:
                "ID of the condition to use when no other conditions match",
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
    db,
  }: NodeExecutionInput): Promise<
    NodeExecutionOutput<
      AgentOutputs<Record<string, unknown>, RouterAgentOutputStructure>
    >
  > {
    try {
      const userMessage = trigger.data["userMessage"] as string | undefined;

      const validatedInputs = validateNodePropertyInputSchema({
        schema: nodePropertyInputSchema,
        inputs,
      });

      let agentConfigurations = validatedInputs.agent_configurations;

      agentConfigurations.output_structure =
        outputStructureSchema as unknown as Record<string, unknown>;
      agentConfigurations.instructions = buildRouterAgentInstructions({
        conditions: validatedInputs.router_configurations.conditions,
        defaultConditionId:
          validatedInputs.router_configurations.default_condition,
        instructions: "",
      });
      agentConfigurations.enable_memory = false;
      agentConfigurations.input_message = "";

      agentConfigurations = {
        ...agentConfigurations,
        [agentConfigurations.model_provider]: {
          ...agentConfigurations[agentConfigurations.model_provider],
          streaming: false, // Disable streaming for router agent
          maxTokens: undefined, // Disable max tokens for router agent
        },
      };

      const agent = createAgentFromNodeInputs<
        unknown,
        typeof outputStructureSchema
      >({
        nodeId: id,
        credentials: credentials || [],
        configurations: agentConfigurations,
      });

      const nodeMemoryManager = creatNodeAgentMemoryManager({
        nodeId: id,
        workflowId,
        sessionId,
        db,
      });

      const agentInput: AgentInputItem[] = [
        ...getContextFromParentAgentNodes(parentNodeOutputs),
        {
          role: "user",
          content:
            `${agent.configs?.inputMessage || ""} ${userMessage || ""}`.trim(),
        },
      ];

      const runResult = await runAgent({
        agent,
        memoryManager: nodeMemoryManager,
        input: agentInput,
      });

      const { structuredOutput, forwardedContext } =
        await processAgenRunResultForNode<
          unknown,
          typeof outputStructureSchema,
          RouterAgentOutputStructure
        >({
          agent,
          runResult,
          nodeId: id,
          workflowId,
          sessionId,
          executionId,
          triggerName: trigger.name,
          memoryManager: nodeMemoryManager,
          disableEventPublishing: true,
          agentInput,
        });

      const evaluationResult = structuredOutput;

      if (!evaluationResult) {
        throw new Error("Router failed to evaluate conditions");
      }

      const selectedCondition = getSelectedCondition(
        evaluationResult.selectedConditionId,
        validatedInputs.router_configurations.conditions,
        validatedInputs.router_configurations.default_condition,
      );

      await publishWorkflowNodeExecutionEvent({
        nodeId: id,
        workflowId,
        executionId,
        sessionId,
        triggerName: trigger.name,
        type: "responded",
        data: {
          content: `**Selected route**: ${selectedCondition.name}`, //\n\n**Reasoning**: ${evaluationResult.reasoning}
        },
      });

      return {
        nodeId: id,
        friendlyName,
        success: true,
        outputs: {
          type: "agent",
          forwardedContext,
          finalOutput: `**Selected route**: ${selectedCondition.name}`,
          additionalData: {
            selectedConditionId: selectedCondition.id,
            selectedConditionName: selectedCondition.name,
            evaluationResults: evaluationResult.evaluationResults,
            reasoning: evaluationResult.reasoning,
          },
        },
      } satisfies NodeExecutionOutput<
        AgentOutputs<Record<string, unknown>, RouterAgentOutputStructure>
      >;
    } catch (error) {
      return await handleNodeExecutionError({
        nodeId: id,
        workflowId,
        executionId,
        error,
        sessionId,
        triggerName: trigger.name,
      });
    }
  }
}
