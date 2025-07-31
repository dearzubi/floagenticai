import { FC, useEffect, useRef, useState, useCallback } from "react";
import { useGetInfiniteChat } from "../../../../../hooks/chat/api/chat.api.hooks.ts";
import { ChatListAPIResponse } from "../../../../../apis/chat/schemas.ts";
import { AppError } from "../../../../../utils/errors";
import { ChatMessage } from "./types.ts";
import ChatHeader from "./header";
import ChatContent from "./ChatContent.tsx";
import ChatInput from "./ChatInput.tsx";
import ChatHistoryError from "./ChatHistoryError.tsx";
import ApprovalSubmissionBar, {
  ApprovalResult,
} from "./ApprovalSubmissionBar.tsx";
import { useDownloadChat } from "../../../../../hooks/chat/use-download-chat.hook.ts";
import { useThrottledCallback } from "use-debounce";
import { CHAT_PERFORMANCE_CONFIG } from "./config.ts";
import { handleSubmitToolApprovals } from "./utils.ts";

const ChatWindow: FC<{
  onClose: () => void;
  workflowName: string;
  workflowId: string;
}> = ({ onClose, workflowName, workflowId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageToEdit, setMessageToEdit] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const prevScrollHeightRef = useRef<number | null>(null);
  const [allApprovalResults, setAllApprovalResults] = useState<
    Map<string, ApprovalResult[]>
  >(new Map());
  const [isSubmittingApprovals, setIsSubmittingApprovals] = useState(false);

  const { download } = useDownloadChat(messages, workflowName);

  const handleScroll = useThrottledCallback(() => {
    if (!chatContainerRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    // Load more when user scrolls to top
    if (scrollTop === 0 && hasNextPage && !isFetchingNextHistoryPage) {
      prevScrollHeightRef.current = scrollHeight;
      fetchNextPage();
      setIsAutoScrolling(false);
    }

    // Check if user has scrolled away from the bottom
    if (scrollHeight - scrollTop > clientHeight + 20) {
      setIsAutoScrolling(false);
    } else {
      setIsAutoScrolling(true);
    }
  }, CHAT_PERFORMANCE_CONFIG.SCROLL_THROTTLE_DELAY);

  const handleContentChange = useThrottledCallback(() => {
    if (chatContainerRef.current && isAutoScrolling) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      });
    }
  }, CHAT_PERFORMANCE_CONFIG.CONTENT_UPDATE_THROTTLE);

  const {
    data: chatHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: isFetchingNextHistoryPage,
    isLoading: isLoadingHistory,
    error: chatHistoryError,
    isError: isChatHistoryError,
  } = useGetInfiniteChat(workflowId, 20, true);

  useEffect(() => {
    if (chatHistoryError && isChatHistoryError) {
      if (chatHistoryError instanceof AppError) {
        console.error("Chat history API Error:", chatHistoryError.toJSON());
      } else {
        console.error("Chat history API Error:", chatHistoryError);
      }
    }
  }, [chatHistoryError, isChatHistoryError]);

  const convertApiChatToMessage = useCallback(
    (apiChat: ChatListAPIResponse[number]): ChatMessage => {
      return {
        id: apiChat.id,
        content: apiChat.content,
        sender: apiChat.role,
        nodeId: apiChat.nodeData?.nodeId || undefined,
        timestamp: new Date(apiChat.createdAt),
        status: apiChat.status,
        artifacts: apiChat.artifacts,
        sessionId: apiChat.sessionId,
        executionId: apiChat.executionId,
      } satisfies ChatMessage;
    },
    [],
  );

  useEffect(() => {
    if (chatHistory?.pages) {
      const allMessages: ChatMessage[] = [];

      // Process pages in reverse order to show oldest first
      chatHistory.pages.forEach((page) => {
        page.forEach((chat) => {
          allMessages.push(convertApiChatToMessage(chat));
        });
      });

      // Sort by timestamp to ensure correct order
      allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setMessages(allMessages);
    }
  }, [chatHistory, convertApiChatToMessage]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (chatContainerRef.current) {
      if (isAutoScrolling) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      } else if (prevScrollHeightRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = null; // Reset after use
      }
    }
  }, [messages, isAutoScrolling]);

  useEffect(() => {
    const newApprovalResults = new Map<string, ApprovalResult[]>();

    messages.forEach((message) => {
      const nodeId = message.nodeId;
      const messageId = message.id;
      const executionId = message.executionId;
      const agentToolApprovals = message.artifacts?.agentToolApprovals || [];
      if (nodeId && messageId && agentToolApprovals?.length) {
        newApprovalResults.set(
          messageId,
          agentToolApprovals.map((approval) => ({
            ...approval,
            nodeId,
            messageId,
            executionId,
          })),
        );
      }
    });

    // Only update if there are changes to avoid infinite loops
    const currentKeys = Array.from(allApprovalResults.keys()).sort();
    const newKeys = Array.from(newApprovalResults.keys()).sort();

    if (JSON.stringify(currentKeys) !== JSON.stringify(newKeys)) {
      setIsSubmittingApprovals(false);
      setAllApprovalResults(newApprovalResults);
    }
  }, [messages]);

  const allApprovals = Array.from(allApprovalResults.values()).flat();
  const pendingApprovals = allApprovals.filter(
    (result) => result.actionStatus === "pending",
  );
  const approvedCount = allApprovals.filter(
    (result) => result.actionStatus === "approved",
  ).length;
  const rejectedCount = allApprovals.filter(
    (result) => result.actionStatus === "rejected",
  ).length;
  const hasAnyApprovals = allApprovals.length > 0;

  const handleApprovalChange = useCallback(
    (messageId: string, nodeId: string, results: ApprovalResult[]) => {
      setAllApprovalResults((prev) => {
        const updated = new Map(prev);
        const resultsWithMessageId = results.map((result) => ({
          ...result,
          nodeId,
          messageId,
        }));
        updated.set(messageId, resultsWithMessageId);
        return updated;
      });
    },
    [],
  );

  const handleSubmitApprovals = async () => {
    setIsSubmittingApprovals(true);
    try {
      await handleSubmitToolApprovals(workflowId, allApprovals);
    } catch (error) {
      console.error("Failed to submit tool approvals:", error);
    }
  };

  return (
    <div
      className={`fixed top-16 bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? "w-[1024px]" : "w-[440px]"
      }`}
    >
      <ChatHeader
        workflowId={workflowId}
        workflowName={workflowName}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onClose={onClose}
        onDownload={download}
      />

      {isChatHistoryError && <ChatHistoryError />}

      {!isChatHistoryError && (
        <>
          <ChatContent
            messagesCount={messages.length}
            isLoadingHistory={isLoadingHistory}
            isFetchingNextHistoryPage={isFetchingNextHistoryPage}
            messages={messages}
            chatContainerRef={chatContainerRef}
            setMessageToEdit={setMessageToEdit}
            workflowId={workflowId}
            setMessages={setMessages}
            onContentChange={handleContentChange}
            onApprovalChange={handleApprovalChange}
            allApprovalResults={allApprovalResults}
            isSubmittingApprovals={isSubmittingApprovals}
          />

          {hasAnyApprovals ? (
            <ApprovalSubmissionBar
              pendingApprovals={pendingApprovals}
              approvedCount={approvedCount}
              rejectedCount={rejectedCount}
              onSubmitApprovals={handleSubmitApprovals}
              isSubmitting={isSubmittingApprovals}
            />
          ) : (
            <ChatInput
              workflowId={workflowId}
              messageToEdit={messageToEdit}
              setMessages={setMessages}
              setMessageToEdit={setMessageToEdit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatWindow;
