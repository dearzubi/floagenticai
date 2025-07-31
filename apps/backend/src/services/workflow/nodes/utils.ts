import { z } from "zod/v4";
import { NodeExecutionError } from "../../../utils/errors/node-execution.error.js";
import { NodeErrorExecutionOutput, NodeExecutionOutput } from "./types.js";
import { logger } from "../../../utils/logger/index.js";
import { publishWorkflowNodeExecutionEvent } from "../execution-engine/utils.js";
import { TriggerNodeNames } from "common";

/**
 * Schema validation function for workflow node inputs and credentials during execution
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param nodeId - ID of the node
 * @param workflowId - ID of the workflow
 * @param executionId - ID of the execution
 * @param errorMessage - Custom error message for validation failure
 * @returns Either the validated data or NodeExecutionOutput with error
 * @throws NodeExecutionError if validation fails
 */
export const validateNodeExecutionSchema = <T>({
  schema,
  data,
  nodeId,
  workflowId,
  executionId,
  errorMessage,
}: {
  schema: z.ZodType<T>;
  data: unknown;
  nodeId: string;
  workflowId: string;
  executionId: string;
  errorMessage: string;
}): T => {
  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    throw new NodeExecutionError({
      nodeId,
      workflowId,
      executionId,
      message: errorMessage,
      errorCode: "SCHEMA_VALIDATION_ERROR",
      fields: {
        issues: validationResult.error.issues,
      },
    });
  }

  return validationResult.data;
};

/**
 * Handle node execution errors and logs them
 * @param nodeId - ID of the node
 * @param workflowId - ID of the workflow
 * @param executionId - ID of the execution
 * @param sessionId - ID of the session
 * @param triggerName - Name of the trigger node
 * @param error - Error to handle
 * @param chatMessageId
 */
export const handleNodeExecutionError = async ({
  nodeId,
  workflowId,
  executionId,
  sessionId,
  triggerName,
  error,
  chatMessageId,
}: {
  nodeId: string;
  workflowId: string;
  executionId: string;
  sessionId: string;
  triggerName: TriggerNodeNames;
  error: unknown;
  chatMessageId?: string;
}): Promise<NodeErrorExecutionOutput> => {
  if (error instanceof NodeExecutionError) {
    logger.error(error.toJSON());
    await publishWorkflowNodeExecutionEvent({
      type: "failed",
      sessionId,
      workflowId,
      executionId,
      triggerName,
      nodeId,
      error: error.toJSON({ removeStack: true }),
    });
    return {
      nodeId,
      success: false,
      error: error.toJSON({ removeStack: true }),
      chatMessageId,
    } satisfies NodeExecutionOutput;
  }

  const nodeExecutionError = new NodeExecutionError({
    message: (error as Error)?.message || "Agent node execution failed",
    nodeId,
    workflowId,
    executionId,
    cause: error as Error,
  });

  await publishWorkflowNodeExecutionEvent({
    type: "failed",
    sessionId,
    workflowId,
    executionId,
    triggerName,
    nodeId,
    error: nodeExecutionError.toJSON({ removeStack: true }),
  });

  logger.error(nodeExecutionError.toJSON());

  return {
    nodeId,
    success: false,
    error: nodeExecutionError.toJSON({ removeStack: true }),
    chatMessageId,
  } satisfies NodeExecutionOutput;
};
