import { AxiosRequestConfig } from "axios";
import { apiClientV1 } from "../../utils/http/http.client.ts";
import {
  ChatListAPIResponse,
  chatListAPIResponseSchema,
  DeleteChatAPIResponse,
  deleteChatAPIResponseSchema,
} from "./schemas.ts";

export const chatApi = {
  getChat: (
    workflowId: string,
    page: number,
    limit: number,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<ChatListAPIResponse>({
      ...config,
      url: `chat`,
      method: "GET",
      params: { workflowId, page, limit },
      schema: chatListAPIResponseSchema,
    });
  },
  deleteChatMessage: (chatId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<DeleteChatAPIResponse>({
      ...config,
      url: `chat/${chatId}`,
      method: "DELETE",
      schema: deleteChatAPIResponseSchema,
    });
  },
  clearChat: (workflowId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<DeleteChatAPIResponse>({
      ...config,
      url: `chat/clear`,
      method: "DELETE",
      params: { workflowId },
      schema: deleteChatAPIResponseSchema,
    });
  },
};
