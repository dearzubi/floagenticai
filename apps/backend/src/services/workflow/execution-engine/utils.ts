import type { Edge, Node, ReactFlowJsonObject } from "@xyflow/react";
import {
  extractNodeNameFromNodeId,
  getWorkflowPubSubChannelName,
  NodeCredentialNames,
  TriggerNodeNames,
  WorkflowBuilderUINodeData,
  WorkflowNodeExecutionEvent,
} from "common";
import { safeParseJSON } from "../../../utils/misc.js";
import { workflowSerialisedReactFlowSchema } from "../../../api/v1/schemas/workflow.schemas.js";
import { JsonObject } from "@hatchet-dev/typescript-sdk";
import {
  CredentialData,
  JsonObjectPath,
  JsonPathValue,
  WorkflowOrchestratorTaskOutputs,
} from "./types.js";
import { logger } from "../../../utils/logger/index.js";
import { NodeExecutionOutput } from "../builder/nodes/types.js";
import { getRedisClient } from "../../../lib/redis/index.js";
import { WorkflowExecutionError } from "../../../utils/errors/workflow-execution.error.js";
import { getCredentialListByIds } from "../../credentials/crud/index.js";
import { OutputsShape as RouterAgentOutputsShape } from "../builder/nodes/agents/router-agent/v1/schemas.js";

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

  nodes.forEach((node) => {
    if (
      node.data.disabled ||
      (node.data.trigger && node.data.name !== triggerName)
    ) {
      return;
    }
    dependencyMap.set(node.id, []);
  });

  const triggerNodes = Array.from(dependencyMap.keys()).filter((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data.trigger && node.data.name === triggerName;
  });

  if (triggerNodes.length === 0) {
    throw new Error(
      `Workflow must have at least one active trigger node for "${triggerName}"`,
    );
  }

  edges.forEach((edge) => {
    const targetId = edge.target;
    const sourceId = edge.source;

    if (dependencyMap.has(targetId) && dependencyMap.has(sourceId)) {
      const currentDeps = dependencyMap.get(targetId) || [];
      if (!currentDeps.includes(sourceId)) {
        dependencyMap.set(targetId, [...currentDeps, sourceId]);
      }
    }
  });

  let hasChanges = false;

  do {
    hasChanges = false;
    const nodesToRemove: string[] = [];

    dependencyMap.forEach((dependencies, nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);

      // If it's not a trigger node and has no dependencies, it's orphaned
      if (!node || (!node.data.trigger && dependencies.length === 0)) {
        nodesToRemove.push(nodeId);
      }
    });

    if (nodesToRemove.length > 0) {
      hasChanges = true;

      // Remove orphaned nodes
      nodesToRemove.forEach((nodeId) => {
        dependencyMap.delete(nodeId);
      });

      // Remove invalid dependency references left after orphaned nodes removal
      dependencyMap.forEach((nodeDependencies, nodeId) => {
        const validDeps = nodeDependencies.filter((depId) =>
          dependencyMap.has(depId),
        );
        if (validDeps.length < nodeDependencies.length) {
          dependencyMap.set(nodeId, validDeps);
        }
      });
    }
  } while (hasChanges);

  if (dependencyMap.size === 0) {
    throw new Error("Workflow doesn't have any valid nodes.");
  }

  return dependencyMap;
};

/**
 * Gets the workflow from the database, parses and validates the flow data, and returns the nodes and edges.
 * @param workflowId - The ID of the workflow
 * @param flowData - The flow data of the workflow
 * @returns An object containing the nodes and edges
 */
export const parseWorkflow = async (
  workflowId: string,
  flowData?: string,
): Promise<{
  nodes: Node<WorkflowBuilderUINodeData>[];
  edges: ReactFlowJsonObject["edges"];
}> => {
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
  processedNodes: Map<string, NodeExecutionOutput>,
): unknown => {
  const parts = reference.trim().split(".");
  if (parts.length < 2) {
    logger.warn(`Invalid reference format: ${reference}`);
    return null;
  }

  const nodeId = parts[0];
  const processedNode = processedNodes.get(nodeId ?? "-");

  if (!processedNode) {
    logger.warn(`Referenced node not found: ${nodeId}`);
    return null;
  }

  if (!processedNode.success) {
    logger.warn(`Referenced node failed: ${nodeId}`);
    return null;
  }

  // Extract the path after the nodeId (skip first part which is nodeId)
  const outputPath = parts.slice(1).join(".");

  //@ts-expect-error - TODO: fix this typing issue later; for now this will work just fine
  return getNodeReferenceValue(processedNode.outputs, outputPath);
};

export const resolveInputReferences = (
  inputs: JsonObject,
  processedNodes: Map<string, NodeExecutionOutput>,
): JsonObject => {
  const resolveValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      // Match patterns like {{nodeId.output.property.path}}
      return value.replace(/\{\{([^}]+)\}\}/g, (match, reference) => {
        try {
          const resolvedValue = resolveNodeOutputReference(
            reference,
            processedNodes,
          );

          if (resolvedValue === null || resolvedValue === undefined) {
            logger.warn(`Could not resolve reference: ${reference}`);
            return match;
          }

          return typeof resolvedValue === "string"
            ? resolvedValue
            : JSON.stringify(resolvedValue);
        } catch (error) {
          logger.error(`Error resolving reference ${reference}:`, error);
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

  return (
    await getCredentialListByIds(
      credentials.map((cred) => cred.id),
      true,
    )
  ).map((cred) => ({
    id: cred.id,
    name: cred.credentialName as NodeCredentialNames,
    data: cred.data,
  }));
};

/**
 * Get all the nodes that are ready to be executed (their dependencies are executed)
 * @param remainingNodeIds - Nodes that are yet to be executed
 * @param executedNodeIds - Nodes that have already been executed
 * @param dependencyMap - Map of node ID to node dependencies
 */
export const getExecutableNodeIds = ({
  remainingNodeIds,
  executedNodeIds,
  dependencyMap,
}: {
  remainingNodeIds: Set<string>;
  executedNodeIds: Set<string>;
  dependencyMap: Map<string, string[]>;
}): string[] => {
  const executableNodes: string[] = [];

  for (const nodeId of remainingNodeIds) {
    if (executedNodeIds.has(nodeId)) {
      continue;
    }

    const nodeDependencies = dependencyMap.get(nodeId) || [];

    // Node's dependencies are either executed or yet to be executed
    // If even one of the deps is invalid reference (does not exist), then the node must not be executed
    // This can happen because of runtime branching e.g. router agent
    const hasValidDependencies =
      nodeDependencies.length === 0 ||
      nodeDependencies.every(
        (depId) => executedNodeIds.has(depId) || remainingNodeIds.has(depId),
      );

    if (!hasValidDependencies) {
      remainingNodeIds.delete(nodeId);
      continue;
    }

    const allDependenciesProcessed =
      nodeDependencies.length === 0 ||
      nodeDependencies.every((depId) => executedNodeIds.has(depId));

    if (allDependenciesProcessed) {
      executableNodes.push(nodeId);
    }
  }

  return executableNodes;
};

/**
 * Filter executable nodes based on router agent conditions
 * Removes nodes that shouldn't execute based on router agent decisions
 * @param executableNodeIds - Initially executable nodes
 * @param remainingNodeIds - Nodes that are yet to be executed
 * @param executedNodesMap - Map of executed nodes and their outputs
 * @param edges - Workflow edges
 */
export const filterExecutableNodesForRouterAgent = ({
  executableNodeIds,
  executedNodesMap,
  edges,
  remainingNodeIds,
}: {
  executableNodeIds: string[];
  executedNodesMap: Map<string, NodeExecutionOutput>;
  edges: Edge[];
  remainingNodeIds: Set<string>;
}): string[] => {
  return executableNodeIds.filter((nodeId) => {
    const incomingRouterEdges = edges.filter(
      (edge) =>
        edge.target === nodeId &&
        extractNodeNameFromNodeId(edge.source) === "router_agent",
    );

    if (!incomingRouterEdges.length) {
      return true;
    }

    for (const routerEdge of incomingRouterEdges) {
      const routerNodeExecutionOutput = executedNodesMap.get(
        routerEdge.source,
      ) as NodeExecutionOutput<RouterAgentOutputsShape> | undefined;

      if (!routerNodeExecutionOutput) {
        continue;
      }

      // Router node failed, skip this execution path
      if (!routerNodeExecutionOutput.success) {
        remainingNodeIds.delete(nodeId);
        return false;
      }

      if (
        routerNodeExecutionOutput.outputs.selectedCondition.id !==
        routerEdge.sourceHandle
      ) {
        remainingNodeIds.delete(nodeId);
        return false;
      }
    }

    return true;
  });
};
