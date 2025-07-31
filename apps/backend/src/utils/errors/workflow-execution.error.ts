import { AppError } from "./app.error.js";
import { IWorkflowExecutionError } from "common";

export class WorkflowExecutionError extends AppError {
  public readonly workflowId: string;
  public readonly executionId?: string;
  public readonly fields?: Record<string, unknown>;
  constructor({
    message,
    workflowId,
    executionId,
    errorCode,
    isOperational,
    cause,
    fields,
  }: {
    message: string;
    workflowId: string;
    executionId?: string;
    errorCode?: string;
    isOperational?: boolean;
    cause?: Error;
    fields?: Record<string, unknown>;
  }) {
    message = message || "Workflow execution failed";
    errorCode = errorCode || "WORKFLOW_EXECUTION_ERROR";
    super(message, 400, errorCode, isOperational, cause);
    this.name = "WorkflowExecutionError";
    this.workflowId = workflowId;
    this.executionId = executionId;
    this.fields = fields;
  }

  override toJSON(options?: {
    removeStack?: boolean;
  }): IWorkflowExecutionError {
    return {
      ...super.toJSON(options),
      workflowId: this.workflowId,
      executionId: this.executionId,
      fields: this.fields,
    };
  }
}
