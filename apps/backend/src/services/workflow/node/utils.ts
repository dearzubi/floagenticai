import { z, ZodError } from "zod/v4";
import { NodeExecutionError } from "../../../utils/errors/node-execution.error.js";
import { NodeErrorExecutionOutput, NodeExecutionOutput } from "./types.js";
import { logger } from "../../../utils/logger/index.js";
import { publishWorkflowNodeExecutionEvent } from "../execution-engine/utils.js";
import { TriggerNodeNames } from "common";
import { ValidationError } from "../../../utils/errors/validation.error.js";

/**
 * Schema validation function for workflow node inputs and credentials during execution
 * @param schema - Zod schema to validate against
 * @param inputs - Data to validate
 * @returns Either the validated data or NodeExecutionOutput with error
 * @throws NodeExecutionError if validation fails
 */
export const validateNodePropertyInputSchema = <T>({
  schema,
  inputs,
}: {
  schema: z.ZodType<T>;
  inputs: unknown;
}): T => {
  const validationResult = schema.safeParse(inputs);

  if (!validationResult.success) {
    throw new ValidationError(
      "Please provide required and valid inputs",
      {
        issues: validationResult.error.issues,
      },
      "INPUT_VALIDATION_ERROR",
    );
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

  const getErrorMessage = (err: unknown): string => {
    if (error instanceof ZodError) {
      return "";
    }
    if (err instanceof Error) {
      return err.message;
    }
    return "Node execution failed";
  };

  const nodeExecutionError = new NodeExecutionError({
    message: getErrorMessage(error),
    nodeId,
    workflowId,
    executionId,
    cause: error as Error,
    fields: error instanceof ZodError ? { issues: error.issues } : undefined,
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
