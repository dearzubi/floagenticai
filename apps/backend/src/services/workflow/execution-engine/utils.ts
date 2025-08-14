import type { Edge, Node, ReactFlowJsonObject } from "@xyflow/react";
import {
  extractNodeNameFromNodeId,
  getWorkflowPubSubChannelName,
  TriggerNodeNames,
  WorkflowBuilderUINodeData,
  WorkflowNodeExecutionEvent,
} from "common";
import { safeParseJSON } from "../../../utils/misc.js";
import { workflowSerialisedReactFlowSchema } from "../../../api/v1/schemas/workflow.schemas.js";
import { JsonObject } from "@hatchet-dev/typescript-sdk";
import {
  JsonObjectPath,
  JsonPathValue,
  WorkflowOrchestratorTaskOutputs,
} from "./types.js";
import { logger } from "../../../utils/logger/index.js";
import { NodeExecutionInput, NodeExecutionOutput } from "../node/types.js";
import { getRedisClient } from "../../../lib/redis/index.js";
import { WorkflowExecutionError } from "../../../utils/errors/workflow-execution.error.js";
import { getCredentialListByIds } from "../../credentials/crud/index.js";
import { AgentInputItem } from "@openai/agents";
import { AgentOutputs } from "../../ai/agent/types.js";
import { CredentialData } from "../../credentials/crud/types.js";
import { RouterAgentOutputStructure } from "../node/nodes/agents/router-agent/v1/schemas.js";

/**
 * Generates a map of node IDs to their dependencies (node IDs that are required to be executed before it).
 * @param triggerName The name of the trigger node that triggers the workflow.
 * @param nodes The nodes of the workflow.
 * @param edges The edges of the workflow.
 * @returns A map of node IDs to their dependencies.
 * @throws {Error} If the workflow doesn't have at least one active trigger node for the given trigger name.
 * @throws {Error} If the workflow doesn't have any valid nodes.
 */
export const generateNodesDependencyMap = (
  triggerName: TriggerNodeNames,
  nodes: Node<WorkflowBuilderUINodeData>[],
  edges: Edge[],
): Map<string, string[]> => {
  const dependencyMap = new Map<string, string[]>();
  let hasTriggerNode = false;

  nodes.forEach((node) => {
    if (
      node.data.disabled ||
      (node.data.trigger && node.data.name !== triggerName)
    ) {
      return;
    }
    dependencyMap.set(node.id, []);

    if (
      node.data.trigger &&
      node.data.name === triggerName &&
      !hasTriggerNode
    ) {
      hasTriggerNode = true;
    }
  });

  if (!hasTriggerNode) {
    throw new Error(
      `Workflow must have at least one active trigger node for "${triggerName}"`,
    );
  }

  edges.forEach((edge) => {
    const targetId = edge.target;
    const sourceId = edge.source;

    if (!dependencyMap.has(targetId) || !dependencyMap.has(sourceId)) {
      return;
    }

    const currentDeps = dependencyMap.get(targetId) || [];

    if (currentDeps.includes(sourceId)) {
      return;
    }

    dependencyMap.set(targetId, [...currentDeps, sourceId]);
  });

  let hasChanges = false;

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  do {
    hasChanges = false;
    const orphanedNodeIds: string[] = [];

    dependencyMap.forEach((dependencies, nodeId) => {
      const node = nodeMap.get(nodeId);

      // If it's not a trigger node and has no dependencies, it's orphaned
      if (!node || (!node.data.trigger && dependencies.length === 0)) {
        orphanedNodeIds.push(nodeId);
      }
    });

    if (orphanedNodeIds.length === 0) {
      break;
    }

    hasChanges = true;

    orphanedNodeIds.forEach((nodeId) => {
      dependencyMap.delete(nodeId);
    });

    // Remove invalid dependency references left after orphaned nodes removal
    dependencyMap.forEach((nodeDependencies, nodeId) => {
      if (nodeDependencies.length === 0) {
        return;
      }

      const validDeps = nodeDependencies.filter((depId) =>
        dependencyMap.has(depId),
      );

      if (validDeps.length === nodeDependencies.length) {
        return;
      }
      dependencyMap.set(nodeId, validDeps);
    });
  } while (hasChanges);

  if (dependencyMap.size === 0) {
    throw new Error("Workflow doesn't have any valid nodes.");
  }

  return dependencyMap;
};

/**
 * Parses and validates the workflow flow data, and returns the nodes and edges.
 * @param workflowId - The ID of the workflow
 * @param flowData - The flow data of the workflow
 * @returns An object containing the nodes and edges
 */
export const parseWorkflow = (
  workflowId: string,
  flowData?: string,
): {
  nodes: Node<WorkflowBuilderUINodeData>[];
  edges: ReactFlowJsonObject["edges"];
} => {
  const serialisedReactFlow = safeParseJSON(
    flowData,
    workflowSerialisedReactFlowSchema,
  );

  if (!serialisedReactFlow) {
    throw new Error(`Workflow with id ${workflowId} is corrupted`);
  }

  return {
    nodes: serialisedReactFlow.nodes as Node<WorkflowBuilderUINodeData>[],
    edges: serialisedReactFlow.edges as Edge[],
  };
};

const getNodeReferenceValue = <P extends JsonObjectPath>(
  outputs: JsonObject,
  path: P,
): JsonPathValue<JsonObject, P> | undefined | null => {
  const keys = path.split(".");
  let current: unknown = outputs;

  for (const key of keys) {
    if (current === null) {
      return null;
    }

    if (current === undefined || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current as JsonPathValue<JsonObject, P>;
};

const resolveNodeOutputReference = (
  reference: string,
  executedNodesMap: Map<string, NodeExecutionOutput>,
): unknown => {
  const parts = reference.trim().split(".");
  if (parts.length < 2) {
    return null;
  }

  const nodeId = parts[0];
  const nodeOutput = executedNodesMap.get(nodeId ?? "-");

  if (!nodeOutput) {
    return null;
  }

  if (!nodeOutput.success) {
    return null;
  }

  const outputPath = parts.slice(1).join(".");

  //@ts-expect-error - TODO: fix this typing issue later; for now this will work just fine
  return getNodeReferenceValue(nodeOutput.outputs, outputPath);
};

export const resolveInputReferences = (
  inputs: JsonObject,
  executedNodesMap: Map<string, NodeExecutionOutput>,
): JsonObject => {
  const resolveValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      // Match patterns like {{nodeId.output.property.path}}
      return value.replace(/\{\{([^}]+)\}\}/g, (match, reference) => {
        try {
          const resolvedValue = resolveNodeOutputReference(
            reference,
            executedNodesMap,
          );

          if (resolvedValue === null || resolvedValue === undefined) {
            return match;
          }

          return typeof resolvedValue === "string"
            ? resolvedValue
            : JSON.stringify(resolvedValue);
        } catch (error) {
          logger.debug(`Error resolving reference ${reference}:`, error);
          return match;
        }
      });
    } else if (Array.isArray(value)) {
      return value.map(resolveValue);
    } else if (value && typeof value === "object") {
      const resolved: JsonObject = {};
      for (const [key, val] of Object.entries(value)) {
        //@ts-expect-error - don't matter
        resolved[key] = resolveValue(val);
      }
      return resolved;
    }

    return value;
  };

  return resolveValue(inputs) as JsonObject;
};

export const publishWorkflowNodeExecutionEvent = async <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  event: WorkflowNodeExecutionEvent<T>,
): Promise<void> => {
  const redisClient = await getRedisClient();
  const redisChannel = getWorkflowPubSubChannelName({
    workflowId: event.workflowId,
    sessionId: event.sessionId,
    triggerName: event.triggerName,
  });

  await redisClient.publish(redisChannel, JSON.stringify(event));
};

/**
 * Handle workflow execution errors and logs them
 * @param workflowId - ID of the workflow
 * @param executionId - ID of the execution
 * @param error - Error to handle
 */
export const handleWorkflowExecutionError = ({
  workflowId,
  executionId,
  error,
}: {
  workflowId: string;
  executionId: string;
  error: unknown;
}): WorkflowOrchestratorTaskOutputs => {
  if (error instanceof WorkflowExecutionError) {
    logger.error(error.toJSON());
    return {
      executionId,
      workflowId,
      success: false,
      error: error.toJSON({ removeStack: true }),
    } satisfies WorkflowOrchestratorTaskOutputs;
  }

  const nodeExecutionError = new WorkflowExecutionError({
    message: (error as Error)?.message || "Workflow node execution failed",
    workflowId,
    executionId,
    cause: error as Error,
  });

  logger.error(nodeExecutionError.toJSON());

  return {
    executionId,
    workflowId,
    success: false,
    error: nodeExecutionError.toJSON({ removeStack: true }),
  } satisfies WorkflowOrchestratorTaskOutputs;
};

/**
 * Get credentials attached to any nodes in the workflow
 * @param nodeDataMap - Map of node ID to node data
 */
export const getWorkflowCredentials = async (
  nodeDataMap: Map<string, WorkflowBuilderUINodeData>,
): Promise<CredentialData[]> => {
  const credentials = [
    ...new Set(
      Array.from(nodeDataMap.values()).flatMap(
        (nodeData) =>
          nodeData.versions.find(
            (version) => version.version === nodeData.currentVersion,
          )?.credentials ?? [],
      ),
    ),
  ];

  return (await getCredentialListByIds(
    credentials.map((cred) => cred.id),
    true,
  )) as CredentialData[];
};

/**
 * Get all the nodes that are ready to be executed (their dependencies are valid and nodes are executed)
 * This also filters out nodes that are not allowed to execute based on router agent conditions in their dependencies.
 * @param remainingNodeIds - Nodes that are yet to be executed
 * @param executedNodesMap - Nodes that have already been executed
 * @param edges - Workflow edges
 * @param dependencyMap - Map of node ID to node dependencies
 */
export const filterExecutableNodes = ({
  remainingNodeIds,
  executedNodesMap,
  edges,
  dependencyMap,
}: {
  remainingNodeIds: Set<string>;
  executedNodesMap: Map<string, NodeExecutionOutput>;
  edges: Edge[];
  dependencyMap: Map<string, string[]>;
}): string[] => {
  const executableNodeIds: string[] = [];
  const nodesToRemove = new Set<string>();

  const routerEdgesByTarget = new Map<string, Edge[]>();

  for (const edge of edges) {
    if (extractNodeNameFromNodeId(edge.source) === "router_agent") {
      const targetEdges = routerEdgesByTarget.get(edge.target);
      if (targetEdges) {
        targetEdges.push(edge);
      } else {
        routerEdgesByTarget.set(edge.target, [edge]);
      }
    }
  }

  for (const nodeId of remainingNodeIds) {
    if (executedNodesMap.has(nodeId)) {
      continue;
    }

    // Router Agent Filtering logic
    const incomingRouterEdges = routerEdgesByTarget.get(nodeId) ?? [];

    if (incomingRouterEdges.length > 0) {
      let allRoutersDecided = true; // false if any router hasn't executed yet
      let routerAllowsNode = true; // false if any router fails or doesn't select this node

      for (const edge of incomingRouterEdges) {
        const routerOutput = executedNodesMap.get(edge.source) as
          | NodeExecutionOutput<
              AgentOutputs<unknown, RouterAgentOutputStructure>
            >
          | undefined;

        if (!routerOutput) {
          allRoutersDecided = false;
          break;
        }

        if (!routerOutput.success) {
          routerAllowsNode = false;
          break;
        }

        const selected =
          routerOutput.outputs?.additionalData?.selectedConditionId;
        if (!edge.sourceHandle || selected !== edge.sourceHandle) {
          routerAllowsNode = false;
          break;
        }
      }

      if (!allRoutersDecided) {
        continue;
      }
      if (!routerAllowsNode) {
        nodesToRemove.add(nodeId);
        continue;
      }
    }

    if (nodesToRemove.has(nodeId)) {
      continue;
    }

    const deps = dependencyMap.get(nodeId) ?? [];
    if (deps.length === 0) {
      executableNodeIds.push(nodeId);
      continue;
    }

    let canExecute = true;
    for (const depId of deps) {
      const depOutput = executedNodesMap.get(depId);

      if (!depOutput) {
        if (!remainingNodeIds.has(depId)) {
          nodesToRemove.add(nodeId); // invalid dep
        }
        canExecute = false; // either pending or invalid
        break;
      }

      if (!depOutput.success) {
        nodesToRemove.add(nodeId);
        canExecute = false;
        break;
      }
    }

    if (canExecute) {
      executableNodeIds.push(nodeId);
    }
  }

  for (const id of nodesToRemove) {
    remainingNodeIds.delete(id);
  }

  return executableNodeIds;
};

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

  for (const nodeOutput of Array.from(parentNodeOutputs.values())) {
    if (!nodeOutput.success) {
      continue;
    }

    const outputs = nodeOutput.outputs as AgentOutputs;

    if (!outputs.type || outputs.type !== "agent") {
      continue;
    }

    let context = outputs.forwardedContext || "";

    context += `${context.length ? "\n\n" : ""}Agent "${nodeOutput.friendlyName}": ${outputs.finalOutput}`;

    agentInput.push({
      role: "assistant",
      status: "completed",
      content: [
        {
          text: context,
          type: "output_text",
        },
      ],
    });
  }

  return agentInput;
};
