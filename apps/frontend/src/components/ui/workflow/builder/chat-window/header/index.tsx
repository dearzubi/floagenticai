import { FC, useState } from "react";
import Button from "./Button.tsx";
import { useClearWorkflowChat } from "../../../../../../hooks/chat/api/chat.api.hooks.ts";
import ClearChatConfirmationModal from "./ClearChatConfirmationModal.tsx";

const ChatWindowHeader: FC<{
  workflowName: string;
  workflowId: string;
  isExpanded: boolean;
  setIsExpanded: (value: (prev: boolean) => boolean) => void;
  onClose: () => void;
  onDownload: () => void;
}> = ({
  workflowName,
  workflowId,
  isExpanded,
  setIsExpanded,
  onClose,
  onDownload,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: clearChat, isPending } = useClearWorkflowChat();

  const handleClearChat = () => {
    clearChat(workflowId, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className="bg-primary-400 text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">{workflowName}</h3>
        <div className="flex gap-2">
          <Button
            onPress={onDownload}
            icon={"lucide:download"}
            tooltipText={"Download Chat"}
          />
          <Button
            onPress={() => setIsModalOpen(true)}
            icon={"lucide:trash-2"}
            tooltipText={"Clear Chat"}
          />
          <Button
            onPress={() => setIsExpanded((prev) => !prev)}
            icon={isExpanded ? "lucide:shrink" : "lucide:expand"}
            tooltipText={isExpanded ? "Collapse" : "Expand"}
          />
          <Button onPress={onClose} icon={"lucide:x"} />
        </div>
      </div>
      <ClearChatConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        confirmDeletion={handleClearChat}
        isPending={isPending}
      />
    </>
  );
};

export default ChatWindowHeader;
