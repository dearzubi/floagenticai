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
    userId,
  }: NodeExecutionInput): Promise<NodeExecutionOutput<AgentOutputs>> {
    try {
      const userMessage = trigger.data["userMessage"] as string | undefined;

      const validatedInputs = validateNodePropertyInputSchema({
        schema: agentConfigurationsPropertyInputSchema,
        inputs,
      });

      const agent = await createAgentFromNodeInputs({
        nodeId: id,
        credentials: credentials || [],
        inputs: validatedInputs,
        db,
        userId,
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

      const { finalOutput, structuredOutput, artifacts, type } =
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
          type,
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
        chatMessageId,
        triggerName: trigger.name,
      });
    }
  }
}
