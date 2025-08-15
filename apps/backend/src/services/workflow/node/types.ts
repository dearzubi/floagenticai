import {
  NodeVersionDescription,
  NodeBaseDescription,
  TriggerNodeNames,
  INodeExecutionError,
  AgentToolApprovalItem,
} from "common";
import { CredentialData } from "../../credentials/crud/types.js";
import { DB } from "../../../database/init.js";

export type NodeExecutionInput = {
  id: string;
  inputs: Record<string, unknown>;
  friendlyName?: string;
  credentials?: CredentialData[];
  parentNodeOutputs?: Map<string, NodeExecutionOutput>;
  trigger: {
    name: TriggerNodeNames;
    data: Record<string, unknown>;
  };
  workflowId: string;
  executionId: string;
  sessionId: string;
  toolApprovalResults?: AgentToolApprovalItem[];
  chatMessageId?: string;
  db: DB;
};

export type NodeSuccessExecutionOutput<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  nodeId: string;
  friendlyName?: string;
  success: true;
  chatMessageId?: string;
  outputs: T;
};

export type NodeErrorExecutionOutput = {
  nodeId: string;
  friendlyName?: string;
  success: false;
  chatMessageId?: string;
  error: INodeExecutionError;
};

export type NodeExecutionOutput<
  T extends Record<string, unknown> = Record<string, unknown>,
> = NodeSuccessExecutionOutput<T> | NodeErrorExecutionOutput;

export interface INodeVersion {
  description: NodeVersionDescription;
  execute(data: NodeExecutionInput): Promise<NodeExecutionOutput>;
  loadMethods?: Record<string, () => Promise<void>>; // TODO: decide input/outputs for load methods
}

export interface IBaseNode {
  nodeVersions: Record<number, INodeVersion>;
  currentVersion: number;
  description: NodeBaseDescription;
  getNodeVersion: (version?: number) => INodeVersion | undefined;
  getLatestVersion: () => number;
  toJSON(): Record<string, unknown>;
}
