import { z } from "zod/v4";

export interface IServerError {
  name: string;
  message: string;
  statusCode: number;
  errorCode: string;
  timestamp: string;
  stack?: string;
}

export interface INodeExecutionError extends IServerError {
  nodeId: string;
  workflowId: string;
  executionId?: string;
  fields?: { issues?: z.core.$ZodIssue[] } & Record<string, unknown>;
}

export interface IWorkflowExecutionError
  extends Omit<INodeExecutionError, "nodeId"> {}

export interface IValidationError extends IServerError {
  fields?: { issues: z.core.$ZodIssue[] } & Record<string, unknown>;
}
