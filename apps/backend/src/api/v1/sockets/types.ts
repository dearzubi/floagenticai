import { ExtendedError, Socket } from "socket.io";
import { User } from "../../../database/entities/user.entity.js";
import { AgentToolApprovalItem, WorkflowNodeExecutionEventTypes } from "common";
import { Chat } from "../../../database/entities/chat.entity.js";

export type MiddlewareFunction = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => void;

export interface ClientToServerEvents {
  ["workflow:chat:trigger"]: (
    data: {
      workflowId: string;
      userMessage: string;
    },
    callback: (persistedMessage: Chat) => void,
  ) => void;
  ["workflow:agent:tool:approval"]: (
    data: {
      workflowId: string;
      approvalResults: AgentToolApprovalItem[];
    },
    callback: (response: { ok: boolean }) => void,
  ) => void;
}

export interface ServerToClientEvents {
  ["workflow:execution:update"]: (data: {
    workflowId: string;
    sessionId: string;
    nodeId: string;
    type: WorkflowNodeExecutionEventTypes;
    response?: string;
  }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: User;
}
