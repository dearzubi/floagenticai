import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { chatApi } from "../../../apis/chat/chat.api.ts";
import {
  ChatListAPIResponse,
  DeleteChatAPIResponse,
} from "../../../apis/chat/schemas.ts";
import { AppError } from "../../../utils/errors";

export const chatQueryKeys = {
  all: ["chats"] as const,
  chat: (workflowId: string) => ["chats", workflowId] as const,
};

/**
 * Get a list of chat from API. The response is paginated and sorted by createdAt in descending order.
 */
export const useGetInfiniteChat = (
  workflowId: string,
  limit: number,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<ChatListAPIResponse, AppError>({
    queryKey: chatQueryKeys.chat(workflowId),
    queryFn: async ({ pageParam = 1 }) => {
      return await chatApi.getChat(workflowId, pageParam as number, limit);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: enabled && Boolean(workflowId),
  });
};

/**
 * Delete/remove a chat from the backend (database).
 */
export const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteChatAPIResponse,
    AppError,
    { chatId: string; workflowId: string }
  >({
    mutationFn: async ({ chatId }) => {
      return await chatApi.deleteChatMessage(chatId);
    },
    onSuccess: (_, { workflowId }) => {
      return queryClient.invalidateQueries({
        queryKey: chatQueryKeys.chat(workflowId),
      });
    },
  });
};

/**
 * Delete/remove all chats from the backend (database).
 */
export const useClearWorkflowChat = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteChatAPIResponse, AppError, string>({
    mutationFn: async (workflowId: string) => {
      return await chatApi.clearChat(workflowId);
    },
    onSuccess: (_, workflowId) => {
      return queryClient.invalidateQueries({
        queryKey: chatQueryKeys.chat(workflowId),
      });
    },
  });
};
