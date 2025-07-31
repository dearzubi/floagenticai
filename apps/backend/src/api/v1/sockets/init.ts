import { Server as SocketIOServer } from "socket.io";
import { logger } from "../../../utils/logger/index.js";
import { InternalServerError } from "../../../utils/errors/internal-server.error.js";
import { getAPIServer } from "../../init.js";
import { authValidationMiddleware } from "./middlewares/auth-validation.middleware.js";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types.js";
import { chatTriggerEvent } from "./events/workflow/chat.trigger.event.js";
import { agentToolApprovalEvent } from "./events/workflow/agent.tool.approval.event.js";

let socketIO: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const initSocketIO = (): void => {
  socketIO = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(getAPIServer());
  socketIO.use(authValidationMiddleware);
  socketIO.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("workflow:chat:trigger", (data, callback) => {
      logger.info(`Received chat trigger event for socket: ${socket.id}`);
      chatTriggerEvent(data, socket, callback);
    });

    socket.on("workflow:agent:tool:approval", (data, callback) => {
      logger.info(
        `Received agent tool approval event for socket: ${socket.id}`,
      );
      agentToolApprovalEvent(data, socket, callback);
    });
  });
  logger.info("Socket.IO is initialised");
};

export const getSocketIO = (): SocketIOServer => {
  if (!socketIO) {
    socketIO = new SocketIOServer(getAPIServer());
  }
  return socketIO;
};

export const shutdownSocketIO = async (): Promise<void> => {
  await new Promise((resolve) => {
    if (!socketIO) {
      resolve(true);
    }
    socketIO.close((error) => {
      if (error) {
        logger.error(
          new InternalServerError(
            error as Error,
            "Failed to properly shutdown Socket.IO.",
          ).toJSON(),
        );
      } else {
        logger.info("Socket.IO is shutdown.");
      }
      resolve(true);
    });
  });
};
