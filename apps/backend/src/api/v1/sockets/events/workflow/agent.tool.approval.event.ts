import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../types.js";
import { Socket } from "socket.io";
import { logger } from "../../../../../utils/logger/index.js";
import { getHatchetClient } from "../../../../../lib/hatchet/index.js";
import { WorkflowAgentToolApprovalResultsEvent } from "../../../../../services/workflow/execution-engine/types.js";
import { WorkflowExecutionError } from "../../../../../utils/errors/workflow-execution.error.js";
import {
  extractNodeNameFromNodeId,
  getWorkflowPubSubChannelName,
  WorkflowNodeExecutionEvent,
} from "common";
import { safeParseJSON } from "common";
import { redisSubscriptionManager } from "../../redis-subscription-manager.js";

export const agentToolApprovalEvent = async (
  data: Parameters<ClientToServerEvents["workflow:agent:tool:approval"]>["0"],
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  callback: Parameters<
    ClientToServerEvents["workflow:agent:tool:approval"]
  >["1"],
): Promise<void> => {
  logger.info(
    `Submitting agent tool approval results for workflow: ${data.workflowId}`,
  );

  const hatchet = getHatchetClient();

  try {
    await hatchet.events.push<WorkflowAgentToolApprovalResultsEvent>(
      "workflow:agent:tool:approval",
      {
        workflowId: data.workflowId,
        approvalResults: data.approvalResults,
      },
    );

    callback({ ok: true });

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
        message:
          "An error occurred while submitting agent tool approval results",
        cause: error as Error,
      }).toJSON(),
    );
  }
};
