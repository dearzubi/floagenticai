import { ChatMessage } from "./types.ts";
import { WorkflowNodeExecutionEvent } from "common";
import { useSocketStore } from "../../../../../stores/socket.store.ts";
import { ApprovalResult } from "./ApprovalSubmissionBar.tsx";

export const applyExecutionEvent = (
  prevMessages: ChatMessage[],
  event: WorkflowNodeExecutionEvent,
): ChatMessage[] => {
  const existingMsgIndex = prevMessages.findIndex(
    (message) =>
      message.nodeId === event.nodeId &&
      message.executionId === event.executionId,
  );

  switch (event.type) {
    case "started":
      if (existingMsgIndex === -1) {
        return [
          ...prevMessages,
          {
            id: event.nodeId + event.executionId,
            content: "",
            sender: "assistant",
            nodeId: event.nodeId,
            executionId: event.executionId,
            sessionId: event.sessionId,
            timestamp: new Date(),
            status: "thinking",
          },
        ] satisfies ChatMessage[];
      }
      return prevMessages;

    case "responded":
      if (typeof event.data.content !== "string") {
        return prevMessages;
      }

      if (existingMsgIndex !== -1) {
        return prevMessages.map((msg, index) =>
          index === existingMsgIndex
            ? ({
                ...msg,
                content: msg.content + event.data.content,
                status: "generating",
                artifacts: event.data.artifacts,
              } satisfies ChatMessage)
            : msg,
        );
      }
      return [
        ...prevMessages,
        {
          id: event.nodeId + event.executionId,
          content: event.data.content,
          sender: "assistant",
          nodeId: event.nodeId,
          executionId: event.executionId,
          sessionId: event.sessionId,
          timestamp: new Date(),
          status: "generating",
          artifacts: event.data.artifacts,
        },
      ] satisfies ChatMessage[];

    case "failed": {
      console.error(event.error);

      const issues = event.error.fields?.issues;

      let errorMessage = event.error.message;

      if (Array.isArray(issues) && issues.length > 0) {
        errorMessage += issues
          .map((issue) => {
            if (issue.path.length > 0) {
              return `\n- **${issue.path.join(" -> ")}**:\n ${issue.message}`;
            } else {
              return `\n- ${issue.message}`;
            }
          })
          .join("");
      }

      if (existingMsgIndex !== -1) {
        return prevMessages.map((msg, index) =>
          index === existingMsgIndex
            ? ({
                ...msg,
                content: msg.content + errorMessage,
                status: "error",
              } satisfies ChatMessage)
            : msg,
        );
      }
      return [
        ...prevMessages,
        {
          id: event.nodeId + event.executionId,
          content: errorMessage,
          sender: "assistant",
          nodeId: event.nodeId,
          executionId: event.executionId,
          sessionId: event.sessionId,
          timestamp: new Date(),
          status: "error",
        },
      ] satisfies ChatMessage[];
    }

    case "completed":
      return existingMsgIndex !== -1
        ? prevMessages.map((msg, index) =>
            index === existingMsgIndex
              ? ({
                  ...msg,
                  status: msg.status === "error" ? "error" : "completed",
                } satisfies ChatMessage)
              : msg,
          )
        : prevMessages;

    default:
      return prevMessages;
  }
};

export const handleSendMessage = async (
  workflowId: string,
  content: string,
  setMessages: (value: (prev: ChatMessage[]) => ChatMessage[]) => void,
) => {
  if (!content.trim()) {
    return;
  }

  const tempId = crypto.randomUUID();

  const userMessage: ChatMessage = {
    id: tempId,
    content: content,
    sender: "user",
    sessionId: "",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);

  try {
    const persistedMessage = await useSocketStore.getState().triggerChat({
      workflowId,
      userMessage: content,
    });
    if (!persistedMessage) {
      return;
    }

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === tempId) {
          return {
            ...msg,
            id: persistedMessage.id,
            timestamp: new Date(persistedMessage.createdAt),
          } satisfies ChatMessage;
        }
        return msg;
      }),
    );
  } catch (err) {
    console.error(err);
  }
};

export const handleSubmitToolApprovals = async (
  workflowId: string,
  approvalResults: ApprovalResult[],
): Promise<boolean> => {
  const response = await useSocketStore.getState().submitToolApprovals({
    workflowId,
    approvalResults,
  });
  return response?.ok ?? false;
};
