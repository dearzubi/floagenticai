import { FC } from "react";
import { ChatMessage } from "../../types.ts";
import Button from "../Button.tsx";
import { handleSendMessage } from "../../utils.ts";

const UserMessage: FC<{
  workflowId: string;
  message: ChatMessage;
  setMessageToEdit: (content: string | null) => void;
  setMessages: (value: (prev: ChatMessage[]) => ChatMessage[]) => void;
}> = ({ message, setMessageToEdit, workflowId, setMessages }) => {
  // const { mutate: deleteMessage } = useDeleteChatMessage();

  const handleResendMessage = async (message: ChatMessage) => {
    await handleSendMessage(workflowId, message.content, setMessages);
  };

  // const handleDelete = () => {
  //   deleteMessage({ chatId: message.id, workflowId });
  // };

  const handleDownload = () => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    const blob = new Blob([message.content], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = `user-message-${message.id}.md`;
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="mb-2 flex flex-col items-end">
      <div className="bg-primary-100 rounded-lg p-3 max-w-[80%] mb-1">
        <p className="text-sm break-words">{message.content}</p>
      </div>
      <div className="flex gap-1">
        <Button
          icon="lucide:pencil"
          onPress={() => setMessageToEdit(message.content)}
          tooltipText="Edit message and send"
        />
        <Button
          icon="lucide:download"
          onPress={handleDownload}
          tooltipText="Download message"
        />
        <Button
          icon="lucide:refresh-cw"
          onPress={() => handleResendMessage(message)}
          tooltipText="Resend message"
        />
        {/* TODO: Maybe add this individual delete option but don't see any much utility for it *}
        {/*<Button*/}
        {/*  icon="lucide:trash-2"*/}
        {/*  onPress={handleDelete}*/}
        {/*  tooltipText="Delete message"*/}
        {/*/>*/}
      </div>
    </div>
  );
};
export default UserMessage;
