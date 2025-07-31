import { FC, RefObject, useEffect, useMemo, useCallback } from "react";
import ChatLoadingIndicator from "./ChatLoadingIndicator.tsx";
import EmptyChat from "./EmptyChat.tsx";
import UserMessage from "./message/user";
import AssistantMessage from "./message/assistant/";
import { ChatMessage } from "./types.ts";
import { WorkflowBuilderUINodeData } from "common";
import { useWorkflowNodeExecutionSocketEvent } from "../../../../../stores/socket.store.ts";
import { Node, useEdges, useNodes } from "@xyflow/react";
import { applyExecutionEvent } from "./utils.ts";
import { CHAT_PERFORMANCE_CONFIG } from "./config.ts";
import { ApprovalResult } from "./ApprovalSubmissionBar.tsx";

const ChatContent: FC<{
  workflowId: string;
  messagesCount: number;
  isLoadingHistory: boolean;
  isFetchingNextHistoryPage: boolean;
  messages: ChatMessage[];
  chatContainerRef: RefObject<HTMLDivElement | null>;
  setMessageToEdit: (content: string | null) => void;
  setMessages: (value: (prev: ChatMessage[]) => ChatMessage[]) => void;
  onContentChange: () => void;
  onApprovalChange: (
    messageId: string,
    nodeId: string,
    results: ApprovalResult[],
  ) => void;
  allApprovalResults: Map<string, ApprovalResult[]>;
  isSubmittingApprovals?: boolean;
}> = ({
  workflowId,
  messagesCount,
  isLoadingHistory,
  isFetchingNextHistoryPage,
  messages,
  chatContainerRef,
  setMessageToEdit,
  setMessages,
  onContentChange,
  onApprovalChange,
  allApprovalResults,
  isSubmittingApprovals,
}) => {
  const nodes = useNodes<Node<WorkflowBuilderUINodeData>>();
  const edges = useEdges();

  const { openByDefaultNodeId } = useMemo(() => {
    const sourceNodeIds = new Set(edges.map((edge) => edge.source));
    const leafNodes = nodes.filter((node) => !sourceNodeIds.has(node.id));
    const openByDefaultNodeId = leafNodes.length === 1 ? leafNodes[0].id : null;

    return { sourceNodeIds, leafNodes, openByDefaultNodeId };
  }, [nodes, edges]);

  const { workflowNodeExecutionQueue, clearWorkflowNodeExecutionQueue } =
    useWorkflowNodeExecutionSocketEvent();

  const messageGroups = useMemo(() => {
    return messages.reduce<
      { id: string; sender: ChatMessage["sender"]; messages: ChatMessage[] }[]
    >((groups, message) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.sender === message.sender) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          id: message.id,
          sender: message.sender,
          messages: [message],
        });
      }
      return groups;
    }, []);
  }, [messages]);

  const processSocketEvents = useCallback(() => {
    const queue = workflowNodeExecutionQueue.get(workflowId) ?? [];
    if (!queue.length) {
      return;
    }

    // Process events in batches to reduce re-renders
    setMessages((prev) => {
      let draft = prev;

      // Group events by message to process them together
      const eventsByMessage = new Map<string, typeof queue>();

      for (const event of queue) {
        const messageKey = `${event.nodeId}-${event.executionId}`;
        if (!eventsByMessage.has(messageKey)) {
          eventsByMessage.set(messageKey, []);
        }
        eventsByMessage.get(messageKey)!.push(event);
      }

      // Process each message's events together
      for (const [_messageKey, events] of eventsByMessage) {
        for (const event of events) {
          draft = applyExecutionEvent(draft, event);
        }
      }

      return draft;
    });

    clearWorkflowNodeExecutionQueue(workflowId);
  }, [
    workflowNodeExecutionQueue,
    workflowId,
    setMessages,
    clearWorkflowNodeExecutionQueue,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(processSocketEvents);
    }, CHAT_PERFORMANCE_CONFIG.CONTENT_UPDATE_THROTTLE);

    return () => clearTimeout(timeoutId);
  }, [processSocketEvents]);

  return (
    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
      {isLoadingHistory && (
        <ChatLoadingIndicator text={"Loading chat history..."} />
      )}
      {isFetchingNextHistoryPage && (
        <ChatLoadingIndicator text={"Loading more messages..."} />
      )}

      {messagesCount === 0 && !isLoadingHistory ? (
        <EmptyChat />
      ) : (
        <div className="space-y-4">
          {messageGroups.map((group, groupIndex) => {
            if (group.sender === "user") {
              return group.messages.map((message) => (
                <UserMessage
                  key={message.id}
                  workflowId={workflowId}
                  message={message}
                  setMessageToEdit={setMessageToEdit}
                  setMessages={setMessages}
                />
              ));
            }

            const isLastGroup = groupIndex === messageGroups.length - 1;

            return (
              <AssistantMessage
                key={group.id}
                group={group}
                workflowId={workflowId}
                openByDefaultNodeId={openByDefaultNodeId}
                onContentChange={onContentChange}
                isLastGroup={isLastGroup}
                onApprovalChange={onApprovalChange}
                allApprovalResults={allApprovalResults}
                isSubmittingApprovals={isSubmittingApprovals}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatContent;
