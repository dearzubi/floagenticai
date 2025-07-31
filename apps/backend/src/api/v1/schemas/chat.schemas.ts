import { z } from "zod/v4";
import { workflowIdSchema } from "./workflow.schemas.js";
import { APIRequestDataSchemas } from "./types.js";

const chatIdSchema = z.uuidv4({
  error: "Invalid chat ID format",
});

const getChatList = {
  query: z.object({
    workflowId: workflowIdSchema,
    page: z.coerce.number().int().optional().default(0),
    limit: z.coerce.number().int().optional().default(10),
  }),
} satisfies APIRequestDataSchemas;

const clearWorkflowChat = {
  query: z.object({
    workflowId: workflowIdSchema,
  }),
};

const deleteChatMessage = {
  params: z.object({
    chatId: chatIdSchema,
  }),
} satisfies APIRequestDataSchemas;

export const chatAPIRequestSchemas = {
  getChatList: getChatList,
  clearWorkflowChat: clearWorkflowChat,
  deleteChatMessage: deleteChatMessage,
};

export type GetChatListAPIRequestData = {
  query: z.infer<typeof getChatList.query>;
};
export type ClearWorkflowChatAPIRequestData = {
  query: z.infer<typeof clearWorkflowChat.query>;
};

export type DeleteChatMessageAPIRequestData = {
  params: z.infer<typeof deleteChatMessage.params>;
};
