import type {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../../types.js";
import { NodeVersionDescription } from "common";
import { getContextFromParentAgentNodes } from "../../../../../execution-engine/utils.js";
import {
  handleNodeExecutionError,
  validateNodePropertyInputSchema,
} from "../../../../utils.js";
import {
  agentConfigurationsPropertyInputSchema,
  getAgentConfigurationsNodeProperty,
} from "../../../../property/properties/agent/agent.config.property.js";
import {
  createAgentFromNodeInputs,
  processAgenRunResultForNode,
  runAgent,
} from "../../../../../../ai/agent/agent.js";
import { creatNodeAgentMemoryManager } from "../../../../../../ai/agent/memory/node.memory.js";
import { AgentOutputs } from "../../../../../../ai/agent/types.js";
import { agentLoadMethods } from "../../../../property/load-methods/agent.load.methods.js";

export class AgentV1Node implements INodeVersion {
  description: NodeVersionDescription;
  loadMethods = agentLoadMethods;

  constructor() {
    this.description = {
      version: 1,
      properties: [getAgentConfigurationsNodeProperty()],
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
    chatMessageId,
    db,
  }: NodeExecutionInput): Promise<NodeExecutionOutput<AgentOutputs>> {
    try {
      const userMessage = trigger.data["userMessage"] as string | undefined;

      const validatedInputs = validateNodePropertyInputSchema({
        schema: agentConfigurationsPropertyInputSchema,
        inputs,
      });

      const agent = createAgentFromNodeInputs({
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
      });

      const { finalOutput, structuredOutput } =
        await processAgenRunResultForNode({
          agent,
          runResult,
          nodeId: id,
          workflowId,
          sessionId,
          executionId,
          triggerName: trigger.name,
          memoryManager: nodeMemoryManager,
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
        },
      } satisfies NodeExecutionOutput<AgentOutputs>;
    } catch (error) {
      // // TODO: this is a temp fix to the issue: https://github.com/openai/openai-agents-js/issues/176
      // if (String(error).includes("Model did not") && finalOutput) {
      //   await publishWorkflowNodeExecutionEvent({
      //     type: "responded",
      //     sessionId,
      //     workflowId,
      //     executionId,
      //     triggerName: trigger.name,
      //     nodeId: id,
      //     data: {
      //       content: finalOutput || "",
      //     },
      //   });
      //   return {
      //     nodeId: id,
      //     friendlyName,
      //     chatMessageId,
      //     success: true,
      //     outputs: {
      //       finalOutput: finalOutput,
      //     },
      //   } satisfies NodeExecutionOutput;
      // }
      //TODO: UI should somehow display or at least alert user about the error, write now it just says Done and nothing shows
      return await handleNodeExecutionError({
        nodeId: id,
        workflowId,
        executionId,
        error,
        sessionId,
        chatMessageId,
        triggerName: trigger.name,
      });
    }
  }
}
