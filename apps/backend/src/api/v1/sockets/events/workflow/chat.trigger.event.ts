import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../types.js";
import { logger } from "../../../../../utils/logger/index.js";
import { Socket } from "socket.io";
import { safeParseJSON } from "../../../../../utils/misc.js";
import {
  extractNodeNameFromNodeId,
  getWorkflowPubSubChannelName,
  WorkflowNodeExecutionEvent,
} from "common";
import { executeWorkflowNoWait } from "../../../../../services/workflow/execution-engine/workflow.js";
import { createChatMessage } from "../../../../../services/chat/crud/index.js";
import {
  ChatSenderRole,
  ChatStatus,
} from "../../../../../database/entities/chat.entity.js";
import { WorkflowExecutionError } from "../../../../../utils/errors/workflow-execution.error.js";
import { redisSubscriptionManager } from "../../redis-subscription-manager.js";

export const chatTriggerEvent = async (
  data: Parameters<ClientToServerEvents["workflow:chat:trigger"]>["0"],
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  callback: Parameters<ClientToServerEvents["workflow:chat:trigger"]>["1"],
): Promise<void> => {
  try {
    logger.info(`Executing chat trigger for workflow: ${data.workflowId}`);

    // TODO: Sanitise user message??
    const userMessage = data.userMessage;

    const persistedUserMessage = await createChatMessage(
      {
        workflowId: data.workflowId,
        role: ChatSenderRole.USER,
        content: userMessage,
        status: ChatStatus.COMPLETED,
        nodeData: "{}",
        artifacts: "{}",
        sessionId: socket.data.user.id, // Using user id as session id for chats; unique session per user
      },
      socket.data.user,
    );

    if (callback) {
      callback(persistedUserMessage);
    }

    await executeWorkflowNoWait({
      workflowId: data.workflowId,
      triggerName: "chat_trigger",
      triggerData: {
        userMessage,
      },
      sessionId: socket.data.user.id, // Using user id as session id for chats; unique session per user
      userId: socket.data.user.id,
    });

    const redisChannel = getWorkflowPubSubChannelName({
      workflowId: data.workflowId,
      sessionId: socket.data.user.id,
      triggerName: "chat_trigger",
    });

    await redisSubscriptionManager.subscribe(socket, redisChannel, (msg) => {
      const event = safeParseJSON<WorkflowNodeExecutionEvent>(msg);

      if (event && extractNodeNameFromNodeId(event.nodeId) !== "chat_trigger") {
        socket.emit("workflow:execution:update", event);
      }
    });
  } catch (error) {
    //TODO: send error to frontend

    logger.error(
      new WorkflowExecutionError({
        workflowId: data.workflowId,
        message: "Chat trigger failed",
        cause: error as Error,
      }).toJSON(),
    );
  }
};
