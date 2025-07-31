import { useCallback } from "react";
import { ChatMessage } from "../../components/ui/workflow/builder/chat-window/types.ts";

export const useDownloadChat = (
  messages: ChatMessage[],
  workflowName: string,
) => {
  const download = useCallback(() => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    const markdownContent = messages
      .map((message) => {
        const sender = message.sender === "user" ? "You" : "Assistant";
        return `**${sender}:**\n\n${message.timestamp}\n\n${message.content}`;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = `${workflowName}-chat.md`;
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [messages, workflowName]);

  return { download };
};
