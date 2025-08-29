import { Request, Response, NextFunction } from "express";
import * as chatService from "../../../services/chat/crud/index.js";
import { User } from "../../../database/entities/user.entity.js";
import {
  GetChatListAPIRequestData,
  ClearWorkflowChatAPIRequestData,
  DeleteChatMessageAPIRequestData,
} from "../schemas/chat.schemas.js";
import { safeParseJSON } from "common";
import { z } from "zod/v4";
import { AgentArtifacts } from "common";

export const getChatListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const query = req.validatedQuery as GetChatListAPIRequestData["query"];
    const chats = await chatService.getChat(
      query.workflowId,
      query.page,
      query.limit,
      user.id,
    );
    res.status(200).json(
      chats.map((chat) => {
        return {
          id: chat.id,
          workflowId: chat.workflowId,
          nodeData:
            safeParseJSON(
              chat.nodeData,
              z.object({
                nodeId: z.string().nonempty(),
                friendlyName: z.string().nullish(),
              }),
            ) ?? {},
          role: chat.role,
          status: chat.status,
          content: chat.content,
          artifacts: safeParseJSON<AgentArtifacts>(chat.artifacts) ?? {},
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          userId: chat.user.id,
          sessionId: chat.sessionId,
          executionId: chat.executionId,
        };
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const clearWorkflowChatController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const query =
      req.validatedQuery as ClearWorkflowChatAPIRequestData["query"];
    await chatService.clearWorkflowChat(query.workflowId, user.id);
    res.status(200).json({ message: "Workflow chat cleared successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteChatMessageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params = req.params as DeleteChatMessageAPIRequestData["params"];
    await chatService.deleteChatMessage(params.chatId, user.id);
    res.status(200).json({ message: "Chat message deleted successfully" });
  } catch (error) {
    next(error);
  }
};
