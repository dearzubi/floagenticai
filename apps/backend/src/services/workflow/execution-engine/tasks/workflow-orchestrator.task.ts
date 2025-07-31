import { getHatchetClient } from "../../../../lib/hatchet/index.js";
import {
  CredentialData,
  WorkflowAgentToolApprovalResultsEvent,
  WorkflowOrchestratorTaskInputs,
  WorkflowOrchestratorTaskOutputs,
} from "../types.js";
import { TASK_CONFIGS } from "./configs.js";
import { DurableContext, Duration } from "@hatchet-dev/typescript-sdk";
import {
  generateNodesDependencyMap,
  getExecutableNodeIds,
  filterExecutableNodesForRouterAgent,
  getWorkflowCredentials,
  handleWorkflowExecutionError,
  parseWorkflow,
  publishWorkflowNodeExecutionEvent,
  resolveInputReferences,
} from "../utils.js";
import { NodeExecutionOutput } from "../../builder/nodes/types.js";
import {
  AgentArtifacts,
  AgentToolApprovalItem,
  extractNodeNameFromNodeId,
  TriggerNodeNames,
  WorkflowBuilderUINodeData,
} from "common";
import { JsonObject } from "@hatchet-dev/typescript-sdk/v1/types.js";
import { workflowNodes } from "../../builder/nodes/index.js";
import { handleNodeExecutionError } from "../../builder/nodes/utils.js";
import { decryptData } from "../../../../utils/encryption.js";
import { safeParseJSON } from "../../../../utils/misc.js";
import { OutputsShape as AgentOutputsShape } from "../../builder/nodes/agents/agent/v1/schemas.js";
import { logger } from "../../../../utils/logger/index.js";
import { OutputsShape as RouterAgentOutputsShape } from "../../builder/nodes/agents/router-agent/v1/schemas.js";
import { createChatMessage } from "../../../chat/crud/index.js";
import {
  ChatSenderRole,
  ChatStatus,
} from "../../../../database/entities/chat.entity.js";
/**
 * Execute a set of nodes in the workflow that are ready to be executed
 *
 * @param sessionId - A unique identifier for the session; mainly used agents to maintain memory per session
 * @param workflowId - The ID of the workflow
 * @param executionId - The ID of the workflow execution
 * @param executableNodeIds - The IDs of the nodes that are ready to be executed
 * @param remainingNodeIds - The IDs of the nodes that are yet to be executed
 * @param nodeDataMap - A map of node ID to node data
 * @param nodeToolApprovalsResults
 * @param executedNodesMap - A map of node ID to node execution output
 * @param dependencyMap - A map of node ID to node dependencies
 * @param trigger - The trigger event that started the workflow execution
 * @param credentials - The credentials attached to the workflow nodes
 * @param ctx - Hatchet workflow execution context
 * @param userId - User Id
 * @param chatMessageIds - (Optional) Chat message Ids associated with a node during previous run. Used to update a message after tool call approvals.
 */
const executeNodes = async ({
  sessionId,
  workflowId,
  executionId,
  executableNodeIds,
  remainingNodeIds,
  nodeDataMap,
  nodeToolApprovalsResults,
  executedNodesMap,
  dependencyMap,
  trigger,
  credentials,
  ctx,
  userId,
  chatMessageIds = new Map<string, string>(),
}: {
  sessionId: string;
  workflowId: string;
  executionId: string;
  executableNodeIds: string[];
  remainingNodeIds: Set<string>;
  nodeDataMap: Map<string, WorkflowBuilderUINodeData>;
  nodeToolApprovalsResults?: Map<string, AgentToolApprovalItem[]>;
  executedNodesMap: Map<string, NodeExecutionOutput>;
  dependencyMap: Map<string, string[]>;
  trigger: {
    name: TriggerNodeNames;
    data: Record<string, unknown>;
  };
  credentials: CredentialData[];
  ctx: DurableContext<WorkflowOrchestratorTaskInputs, {}>;
  userId?: string;
  chatMessageIds?: Map<string, string>;
}): Promise<void> => {
  const nodeExecutionPromises: Promise<NodeExecutionOutput>[] = [];

  const nodeExecutionPromisesMap = new Map<
    Promise<NodeExecutionOutput>,
    string
  >();

  for (const nodeId of executableNodeIds) {
    const nodeData = nodeDataMap.get(nodeId);
    if (!nodeData) {
      continue;
    }

    const selectedNodeVersionData = nodeData.versions.find(
      (version) => version.version === nodeData.currentVersion,
    );

    if (!selectedNodeVersionData) {
      continue;
    }

    const nodeCredentials = credentials.filter((credential) => {
      if (Array.isArray(selectedNodeVersionData.credentials)) {
        return selectedNodeVersionData.credentials
          .map((cred) => cred.id)
          .includes(credential.id);
      }
      return false;
    });

    const rawInputs = (selectedNodeVersionData.inputs ?? {}) as JsonObject;

    // Resolve parent node output references like {{nodeId.outputVariable}}
    // in the string input fields
    const resolvedInputs = resolveInputReferences(rawInputs, executedNodesMap);

    const nodeDependencies = dependencyMap.get(nodeId) || [];

    const parentNodeOutputsMap = new Map(
      nodeDependencies
        .map((depId) => executedNodesMap.get(depId))
        .filter(Boolean)
        .map((parentNodeOutput) => [
          (parentNodeOutput as NodeExecutionOutput).nodeId,
          parentNodeOutput as NodeExecutionOutput,
        ]),
    );

    const node = workflowNodes[nodeData.category][nodeData.name];
    const nodeVersion = node?.getNodeVersion(nodeData.currentVersion);

    if (!nodeVersion) {
      continue;
    }

    await publishWorkflowNodeExecutionEvent({
      type: "started",
      workflowId,
      sessionId,
      executionId,
      triggerName: trigger.name,
      nodeId,
    });

    const nodeExecutionPromise = nodeVersion.execute({
      id: nodeData.id,
      inputs: resolvedInputs,
      friendlyName: nodeData.friendlyName,
      credentials: nodeCredentials,
      parentNodeOutputs: parentNodeOutputsMap,
      trigger,
      workflowId,
      executionId,
      sessionId,
      toolApprovalResults: nodeToolApprovalsResults?.get(nodeId),
      chatMessageId: chatMessageIds?.get(nodeId),
    });

    nodeExecutionPromises.push(nodeExecutionPromise);
    nodeExecutionPromisesMap.set(nodeExecutionPromise, nodeId);
  }

  const executionResults = await Promise.allSettled(nodeExecutionPromises);

  for (let i = 0; i < executionResults.length; i++) {
    const result = executionResults[i];
    if (!result) {
      continue;
    }
    if (result.status === "fulfilled") {
      const nodeExecutionOutput = result.value;
      executedNodesMap.set(nodeExecutionOutput.nodeId, nodeExecutionOutput);
      remainingNodeIds.delete(nodeExecutionOutput.nodeId);

      const nodeData = nodeDataMap.get(nodeExecutionOutput.nodeId);

      if (nodeExecutionOutput.success && userId && !nodeData?.trigger) {
        await publishWorkflowNodeExecutionEvent({
          type: "completed",
          sessionId,
          workflowId,
          executionId,
          triggerName: trigger.name,
          nodeId: nodeExecutionOutput.nodeId,
        });
        const nodeName = extractNodeNameFromNodeId(nodeExecutionOutput.nodeId);
        let content: string | undefined;
        let artifacts: AgentArtifacts = {};

        if (nodeName === "agent" || nodeName === "one_inch_agent") {
          content = (nodeExecutionOutput.outputs as AgentOutputsShape)
            .finalOutput;
          artifacts =
            (nodeExecutionOutput.outputs as AgentOutputsShape).artifacts ?? {};
        } else if (nodeName === "router_agent") {
          content = `**Selected route**: ${
            (nodeExecutionOutput.outputs as RouterAgentOutputsShape)
              .selectedCondition.name
          }`;
        }

        const chat = await createChatMessage(
          {
            id: nodeExecutionOutput.chatMessageId,
            workflowId,
            role: ChatSenderRole.ASSISTANT,
            content: content ?? "",
            status: ChatStatus.COMPLETED,
            nodeData: JSON.stringify({
              nodeId: nodeExecutionOutput.nodeId,
              friendlyName: nodeExecutionOutput.friendlyName,
            }),
            artifacts: JSON.stringify(artifacts),
            executionId,
            sessionId,
          },
          userId,
        );

        chatMessageIds?.set(nodeExecutionOutput.nodeId, chat.id);
      }

      if (!nodeExecutionOutput.success && userId) {
        const issues = nodeExecutionOutput.error.fields?.issues;

        let errorMessage = nodeExecutionOutput.error.message;

        if (Array.isArray(issues) && issues.length > 0) {
          errorMessage += issues
            .map((issue) => {
              if (issue.path.length > 0) {
                return `\n- **${issue.path.join(" -> ")}**:\n ${issue.message}`;
              } else {
                return `\n- ${issue.message}`;
              }
            })
            .join("");
        }

        await createChatMessage(
          {
            id: nodeExecutionOutput.chatMessageId,
            workflowId,
            role: ChatSenderRole.ASSISTANT,
            content: errorMessage,
            status: ChatStatus.ERROR,
            nodeData: JSON.stringify({
              nodeId: nodeExecutionOutput.nodeId,
              friendlyName: nodeExecutionOutput.friendlyName,
            }),
            executionId,
            sessionId,
          },
          userId,
        );
      }
    } else {
      const taskPromise = nodeExecutionPromises[
        i
      ] as Promise<NodeExecutionOutput>;
      const nodeId = nodeExecutionPromisesMap.get(taskPromise);

      if (!nodeId) {
        continue;
      }

      const nodeExecutionOutput = await handleNodeExecutionError({
        nodeId,
        workflowId,
        executionId,
        sessionId,
        triggerName: trigger.name,
        error: new Error(String(result.reason)),
      });

      if (userId) {
        await createChatMessage(
          {
            id: nodeExecutionOutput.chatMessageId,
            workflowId,
            role: ChatSenderRole.ASSISTANT,
            content: nodeExecutionOutput.error.message,
            status: ChatStatus.ERROR,
            nodeData: JSON.stringify({
              nodeId: nodeExecutionOutput.nodeId,
              friendlyName: nodeExecutionOutput.friendlyName,
            }),
            executionId,
            sessionId,
          },
          userId,
        );
      }

      executedNodesMap.set(nodeId, nodeExecutionOutput);
      remainingNodeIds.delete(nodeId);
    }
  }

  const agentsNeedsToolApprovals = executionResults
    .filter(
      (result): result is PromiseFulfilledResult<NodeExecutionOutput> =>
        result.status === "fulfilled" &&
        result.value.success &&
        (
          (result.value.outputs as AgentOutputsShape)?.artifacts
            ?.agentToolApprovals ?? []
        ).length > 0,
    )
    .map((result) => result.value);

  if (agentsNeedsToolApprovals.length > 0) {
    logger.debug(
      `Agents need tool approvals, waiting for approval events: ${workflowId}`,
    );

    const events = await ctx.waitFor({
      eventKey: "workflow:agent:tool:approval",
      expression: `input.workflowId == '${workflowId}'`,
    });

    const toolApprovalEvent = (events?.["workflow:agent:tool:approval"] ||
      []) as WorkflowAgentToolApprovalResultsEvent[];

    for (const event of toolApprovalEvent) {
      if (event.workflowId !== workflowId) {
        continue;
      }
      const executableNodeIds = event.approvalResults.map(
        (result) => result.nodeId,
      );
      const nodeToolApprovalsResults = new Map<
        string,
        AgentToolApprovalItem[]
      >();

      for (const result of event.approvalResults) {
        if (!nodeToolApprovalsResults.has(result.nodeId)) {
          nodeToolApprovalsResults.set(result.nodeId, []);
        }
        nodeToolApprovalsResults.get(result.nodeId)?.push(result);
      }

      await executeNodes({
        sessionId,
        workflowId,
        executionId,
        dependencyMap,
        nodeDataMap,
        executedNodesMap,
        remainingNodeIds,
        executableNodeIds,
        trigger,
        credentials,
        ctx,
        nodeToolApprovalsResults,
        chatMessageIds,
        userId,
      });
    }
  }
};

const hatchet = getHatchetClient();

export const workflowOrchestratorTask = hatchet.durableTask<
  //@ts-expect-error - TODO: look into it later
  WorkflowOrchestratorTaskInputs,
  WorkflowOrchestratorTaskOutputs
>({
  name: "fa-workflow",
  retries: TASK_CONFIGS.retries,
  executionTimeout: TASK_CONFIGS.executionTimeout as Duration,
  fn: async (input, ctx) => {
    const { workflowId, triggerName, encryptedTriggerData, sessionId, userId } =
      input;
    const executionId = ctx.workflowRunId();
    try {
      const decryptedFlowData = decryptData(input.encryptedFlowData);

      const { nodes, edges } = await parseWorkflow(
        workflowId,
        decryptedFlowData.ok ? decryptedFlowData.plainText : undefined,
      );
      const nodeDataMap = new Map(nodes.map((node) => [node.id, node.data]));
      const credentials = await getWorkflowCredentials(nodeDataMap);

      const dependencyMap = generateNodesDependencyMap(
        triggerName,
        nodes,
        edges,
      );

      const executedNodesMap = new Map<string, NodeExecutionOutput>();
      const remainingNodeIds = new Set(Array.from(dependencyMap.keys()));

      const maxIterations = remainingNodeIds.size * 2;
      let currentIteration = 0;

      const decryptedTriggerData = decryptData(encryptedTriggerData);

      const triggerData = safeParseJSON<Record<string, unknown>>(
        decryptedTriggerData.ok ? decryptedTriggerData.plainText : "{}",
      );

      while (remainingNodeIds.size > 0 && currentIteration < maxIterations) {
        currentIteration++;

        let executableNodeIds = getExecutableNodeIds({
          remainingNodeIds,
          executedNodeIds: new Set(Array.from(executedNodesMap.keys())),
          dependencyMap,
        });

        // Filter out nodes that shouldn't execute based on router agent conditions
        executableNodeIds = filterExecutableNodesForRouterAgent({
          executableNodeIds,
          remainingNodeIds,
          executedNodesMap,
          edges,
        });

        if (executableNodeIds.length === 0) {
          throw new Error(
            `Workflow deadlock detected. Unexecutable nodes: ${Array.from(remainingNodeIds)}`,
          );
        }

        await executeNodes({
          sessionId,
          workflowId,
          executionId,
          dependencyMap,
          nodeDataMap,
          executedNodesMap,
          remainingNodeIds,
          executableNodeIds,
          trigger: {
            name: triggerName,
            data: triggerData ? triggerData : {},
          },
          credentials,
          ctx,
          userId,
        });
      }

      return {
        workflowId,
        executionId,
        success: true,
        outputs: Array.from(executedNodesMap.values()),
      } satisfies WorkflowOrchestratorTaskOutputs;
    } catch (error) {
      return handleWorkflowExecutionError({
        workflowId,
        executionId,
        error,
      });
    }
  },
});
