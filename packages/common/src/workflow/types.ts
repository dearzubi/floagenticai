import {
  nodeCategories,
  nodeNames,
  nodePropertyTypes,
  triggerNodeNames,
} from "./constants.js";
import { z } from "zod/v4";
import {
  nodePropertyDisplayConditionsSchema,
  nodePropertyDisplayOptionsSchema,
  nodeCredentialDisplayOptionsSchema,
  nodePropertyOptionSchema,
  nodePropertySchema,
  nodeBaseDescriptionSchema,
  nodeCredentialDescriptionSchema,
  nodeHintSchema,
  nodeVersionDescriptionSchema,
  nodeSerialisedSchema,
} from "./schemas/index.js";
import { CommonPrimitiveTypes } from "../shared/index.js";
import { INodeExecutionError } from "../errors/index.js";

export type TriggerNodeNames = (typeof triggerNodeNames)[number];
export type NodeNames = (typeof nodeNames)[number];
export type NodeCategories = (typeof nodeCategories)[number];
export type NodePropertyTypes = (typeof nodePropertyTypes)[number];
export type NodePropertyDisplayConditions = z.infer<
  typeof nodePropertyDisplayConditionsSchema
>;
export type NodePropertyDisplayOptions = z.infer<
  typeof nodePropertyDisplayOptionsSchema
>;
export type NodeCredentialDisplayOptions = z.infer<
  typeof nodeCredentialDisplayOptionsSchema
>;
export type NodePropertyOption = z.infer<typeof nodePropertyOptionSchema>;

export interface INodeProperty {
  label: string;
  name: string;
  type: NodePropertyTypes;
  description?: string;
  hint?: string;
  placeholder?: string;
  optional?: boolean;
  noDataExpression?: boolean;
  disabledOptions?: NodePropertyDisplayOptions;
  displayOptions?: NodePropertyDisplayOptions;
  options?: NodePropertyOption[];
  hidden?: boolean;
  loadMethod?: string;
  default?: CommonPrimitiveTypes | CommonPrimitiveTypes[];
  collection?: INodeProperty[];
  isMultiline?: boolean;
  minNumber?: number;
  maxNumber?: number;
  gridItems?: IGridItem[];
}

export interface IGridItem {
  label: string;
  name: string;
  description?: string;
  icon?: string;
  collection?: INodeProperty[];
}

export type NodeProperty = z.infer<typeof nodePropertySchema>;

export type NodeBaseDescription = z.infer<typeof nodeBaseDescriptionSchema>;
export type NodeCredentialDescription = z.infer<
  typeof nodeCredentialDescriptionSchema
>;
export type NodeHint = z.infer<typeof nodeHintSchema>;
export type NodeVersionDescription = z.infer<
  typeof nodeVersionDescriptionSchema
>;

export type NodeSerialised = z.infer<typeof nodeSerialisedSchema>;

export type WorkflowBuilderUINodeData = NodeBaseDescription & {
  id: string;
  currentVersion: number;
  friendlyName?: string;
  versions: (NodeVersionDescription & {
    inputs: Record<string, unknown>;
    credentials?: { name: string; id: string }[];
  })[];
};

type WorkflowBaseEvent = {
  executionId: string;
  sessionId: string;
  workflowId: string;
  triggerName: TriggerNodeNames;
};

type WorkflowNodeBaseEvent = WorkflowBaseEvent & {
  nodeId: string;
};

export type WorkflowNodeExecutionStartedEvent = WorkflowNodeBaseEvent & {
  type: "started";
};

export type WorkflowNodeExecutionCompletedEvent = WorkflowNodeBaseEvent & {
  type: "completed";
};

export type AgentToolCallItem = {
  toolName: string;
  toolInput: Record<string, unknown>;
  toolOutput: string;
  toolIcon?: string | null;
};

export type AgentToolApprovalActionStatus = "pending" | "approved" | "rejected";

export type AgentToolApprovalItem = {
  arguments: string;
  callId: string;
  id?: string;
  name: string;
  providerData?: Record<string, unknown>;
  status?: "in_progress" | "completed" | "incomplete";
  type: "function_call";
  actionStatus: AgentToolApprovalActionStatus;
  nodeId: string;
};

export type AgentArtifacts = {
  agentToolCalls?: AgentToolCallItem[];
  agentToolApprovals?: AgentToolApprovalItem[];
};

export type WorkflowNodeExecutionRespondedEvent<
  T extends Record<string, unknown> = Record<string, unknown>,
> = WorkflowNodeBaseEvent & {
  type: "responded";
  data: {
    content: string;
    artifacts?: AgentArtifacts;
    stats?: {}; // TODO: Define stats type
    extra?: T;
  };
};

export type WorkflowNodeExecutionFailedEvent = WorkflowNodeBaseEvent & {
  type: "failed";
  error: INodeExecutionError;
};

export type WorkflowNodeExecutionEvent<
  T extends Record<string, unknown> = Record<string, unknown>,
> =
  | WorkflowNodeExecutionStartedEvent
  | WorkflowNodeExecutionCompletedEvent
  | WorkflowNodeExecutionRespondedEvent<T>
  | WorkflowNodeExecutionFailedEvent;

export type WorkflowNodeExecutionEventTypes =
  WorkflowNodeExecutionEvent["type"];

export type WorkflowExecutionEventTypes =
  | "workflowStarted"
  | "workflowCompleted";
export type WorkflowExecutionEvent = WorkflowBaseEvent & {
  type: WorkflowExecutionEventTypes;
};
