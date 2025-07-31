import { AppError } from "./app.error.js";
import { INodeExecutionError } from "common";

export class NodeExecutionError extends AppError {
  public readonly nodeId: string;
  public readonly workflowId: string;
  public readonly executionId?: string;
  public readonly fields?: Record<string, unknown>;
  constructor({
    message,
    nodeId,
    workflowId,
    executionId,
    errorCode,
    isOperational,
    cause,
    fields,
  }: {
    message: string;
    nodeId: string;
    workflowId: string;
    executionId?: string;
    errorCode?: string;
    isOperational?: boolean;
    cause?: Error;
    fields?: Record<string, unknown>;
  }) {
    message = message || "Node execution failed";
    errorCode = errorCode || "NODE_EXECUTION_ERROR";
    super(message, 400, errorCode, isOperational, cause);
    this.name = "NodeExecutionError";
    this.nodeId = nodeId;
    this.workflowId = workflowId;
    this.executionId = executionId;
    this.fields = fields;
  }

  override toJSON(options?: { removeStack?: boolean }): INodeExecutionError {
    return {
      ...super.toJSON(options),
      nodeId: this.nodeId,
      workflowId: this.workflowId,
      executionId: this.executionId,
      fields: this.fields,
    };
  }
}
