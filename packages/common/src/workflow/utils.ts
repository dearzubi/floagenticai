import { NodeNames, TriggerNodeNames } from "./types.js";

/**
 * Extract the node name from the given node ID where the node ID is in the format `node_name_integer_index`.
 * @param nodeId - The node ID
 */
export const extractNodeNameFromNodeId = (nodeId: string): NodeNames => {
  const nodeIdParts = nodeId.split("_");
  nodeIdParts.pop();
  return nodeIdParts.join("_") as NodeNames;
};

/**
 * Get the Redis pub/sub channel name for a workflow execution session
 * @param workflowId - The ID of the workflow
 * @param sessionId - The unique ID of the current session
 * @param triggerName - The name of the trigger node
 */
export const getWorkflowPubSubChannelName = ({
  workflowId,
  sessionId,
  triggerName,
}: {
  workflowId: string;
  sessionId: string;
  triggerName: TriggerNodeNames;
}): string => {
  return `fa:workflow_executions:${workflowId}-${triggerName}-${sessionId}`;
};
