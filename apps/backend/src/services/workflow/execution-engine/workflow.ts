import { TriggerNodeNames } from "common";
import { WorkflowOrchestratorTaskOutputs } from "./types.js";
import { handleWorkflowExecutionError } from "./utils.js";
import { JsonObject } from "@hatchet-dev/typescript-sdk/v1/types.js";
import { getWorkflow } from "../crud/index.js";
import { workflowOrchestratorTask } from "./tasks/workflow-orchestrator.task.js";
import WorkflowRunRef from "@hatchet-dev/typescript-sdk/util/workflow-run-ref.js";
import { encryptData } from "../../../utils/encryption.js";

/**
 * Starts a workflow execution and waits for it to complete
 * @param workflowId - The ID of the workflow
 * @param triggerName - The name of the trigger node
 * @param triggerData - The data to pass to the trigger node
 * @param sessionId - A unique identifier for the session; mainly used agents to maintain memory per session
 * @param userId - The ID of the user who is triggering the workflow (optional)
 */
export const executeWorkflowWait = async ({
  workflowId,
  triggerName,
  triggerData = {},
  sessionId,
  userId,
}: {
  workflowId: string;
  triggerName: TriggerNodeNames;
  triggerData: JsonObject;
  sessionId: string;
  userId?: string;
}): Promise<WorkflowOrchestratorTaskOutputs> => {
  try {
    const workflow = await getWorkflow(workflowId, userId, true);
    const workflowRunRef = await workflowOrchestratorTask.runNoWait({
      sessionId,
      workflowId,
      encryptedFlowData: workflow.flowData,
      triggerName,
      encryptedTriggerData: encryptData(JSON.stringify(triggerData)),
      userId,
    });

    return await workflowRunRef.output;
  } catch (error) {
    return handleWorkflowExecutionError({
      workflowId,
      executionId: "", // TODO: Should we use a custom executionId instead of hatchet workflow run id? pass it with other inputs?
      error,
    });
  }
};

/**
 * Starts a workflow execution and does not wait for it to complete
 * @param workflowId - The ID of the workflow
 * @param triggerName - The name of the trigger node
 * @param triggerData - The data to pass to the trigger node
 * @param sessionId - A unique identifier for the session; mainly used agents to maintain memory per session
 * @param userId - The ID of the user who is triggering the workflow (optional)
 */
export const executeWorkflowNoWait = async ({
  workflowId,
  triggerName,
  triggerData = {},
  sessionId,
  userId,
}: {
  workflowId: string;
  triggerName: TriggerNodeNames;
  triggerData: Record<string, unknown>;
  sessionId: string;
  userId?: string;
}): Promise<WorkflowRunRef.default<WorkflowOrchestratorTaskOutputs>> => {
  const workflow = await getWorkflow(workflowId, userId, true);

  return workflowOrchestratorTask.runNoWait({
    sessionId,
    workflowId,
    encryptedFlowData: workflow.flowData,
    triggerName,
    encryptedTriggerData: encryptData(JSON.stringify(triggerData)),
    userId,
  });
};
