import {
  AgentToolApprovalItem,
  IWorkflowExecutionError,
  NodeCredentialNames,
  TriggerNodeNames,
} from "common";
import { JsonObject } from "@hatchet-dev/typescript-sdk";
import { NodeExecutionOutput } from "../nodes/types.js";

export type WorkflowOrchestratorTaskInputs = {
  userId?: string;
  workflowId: string;
  sessionId: string;
  encryptedFlowData: string;
  triggerName: TriggerNodeNames;
  encryptedTriggerData: string;
};

export type WorkflowOrchestratorTaskOutputs =
  | {
      workflowId: string;
      executionId: string;
      success: true;
      outputs: NodeExecutionOutput[];
    }
  | {
      workflowId: string;
      executionId: string;
      success: false;
      error: IWorkflowExecutionError;
    };

export type CredentialData = {
  id: string;
  name: NodeCredentialNames;
  data: Record<string, string>;
};

export type JsonObjectPath = string;

export type JsonPathValue<
  T extends JsonObject,
  P extends string,
> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? T[K] extends JsonObject
      ? JsonPathValue<T[K], R>
      : unknown
    : unknown
  : P extends keyof T
    ? T[P]
    : unknown;

export type WorkflowAgentToolApprovalResultsEvent = {
  workflowId: string;
  approvalResults: AgentToolApprovalItem[];
};
