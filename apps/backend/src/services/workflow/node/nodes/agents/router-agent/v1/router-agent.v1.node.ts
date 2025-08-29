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
import { getAgentConfigurationsNodeProperty } from "../../../../property/properties/agent/agent.config.property.js";
import {
  createAgentFromNodeInputs,
  processAgenRunResultForNode,
  runAgent,
} from "../../../../../../ai/agent/agent.js";
import { creatNodeAgentMemoryManager } from "../../../../../../ai/agent/memory/node.memory.js";
import { AgentOutputs } from "../../../../../../ai/agent/types.js";
import { AgentInputItem } from "@openai/agents";
import { agentLoadMethods } from "../../../../property/load-methods/agent.load.methods.js";

export class RouterAgentV1Node implements INodeVersion {
  description: NodeVersionDescription;
  loadMethods = {
    ...agentLoadMethods,
  };

  constructor() {
    const agentConfigurationsProperty = getAgentConfigurationsNodeProperty({
      disableInstructionsProperty: true,
      disableMemoryProperty: true,
      disableOutputStructureProperty: true,
    });

    this.description = {
      version: 1,
      properties: [
        agentConfigurationsProperty,
        {
          name: "router_configurations",
          label: "Router Configurations",
          type: "grid",
          gridItems: [
            {
              label: "Routing Configurations",
              name: "routing_configurations",
              icon: "material-symbols:arrow-split-rounded",
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
                      description:
                        "Unique identifier to represent output route.",
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
                      description:
                        "Describe when should this condition be met.",
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

      validatedInputs.agent_configurations.llm_configurations.output_structure =
        outputStructureSchema as unknown as Record<string, unknown>;
      validatedInputs.agent_configurations.llm_configurations.instructions =
        buildRouterAgentInstructions({
          conditions:
            validatedInputs.router_configurations.routing_configurations
              .conditions,
          defaultConditionId:
            validatedInputs.router_configurations.routing_configurations
              .default_condition,
          instructions: "",
        });
      validatedInputs.agent_configurations.llm_configurations.enable_memory =
        false;

      if (
        validatedInputs.agent_configurations.llm_configurations
          .advanced_settings
      ) {
        validatedInputs.agent_configurations.llm_configurations.advanced_settings =
          {
            ...validatedInputs.agent_configurations.llm_configurations
              .advanced_settings,
            maxTokens: undefined,
            streaming: false,
          };
      }

      const agent = await createAgentFromNodeInputs<
        unknown,
        typeof outputStructureSchema
      >({
        nodeId: id,
        credentials: credentials || [],
        inputs: validatedInputs,
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
        validatedInputs.router_configurations.routing_configurations.conditions,
        validatedInputs.router_configurations.routing_configurations
          .default_condition,
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
