import { FC, useEffect, useState } from "react";
import { Button, Textarea } from "@heroui/react";
import { handleEnterKeyPressedInInputField } from "../../../../../utils/ui.ts";
import { Icon } from "@iconify/react";
import { handleSendMessage } from "./utils.ts";
import { ChatMessage } from "./types.ts";

const ChatInput: FC<{
  workflowId: string;
  messageToEdit: string | null;
  setMessageToEdit: (value: string | null) => void;
  setMessages: (value: (prev: ChatMessage[]) => ChatMessage[]) => void;
}> = ({ workflowId, setMessageToEdit, messageToEdit, setMessages }) => {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (messageToEdit) {
      setInput(messageToEdit);
      setMessageToEdit(null);
    }
  }, [messageToEdit]);

  return (
    <div className="flex flex-col p-3 border-t border-gray-200">
      <Textarea
        onValueChange={setInput}
        value={input}
        placeholder="Type a message..."
        className="text-sm focus:outline-none focus:ring-0 data-[hover=true]:bg-transparent"
        classNames={{
          innerWrapper: "bg-white ",
          inputWrapper:
            "min-h-4 p-0 py-2 bg-transparent shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
        }}
        minRows={1}
        onKeyDown={(e) => {
          handleEnterKeyPressedInInputField(e, async () => {
            await handleSendMessage(workflowId, input, setMessages);
            setInput("");
          });
        }}
      />
      <div className="flex justify-end">
        <Button
          isIconOnly
          type="submit"
          isDisabled={!input.trim()}
          className="focus:outline-none hover:border-transparent bg-default-100 rounded-full hover:bg-default-200"
          onPress={async () => {
            await handleSendMessage(workflowId, input, setMessages);
            setInput("");
          }}
        >
          <Icon icon={"lucide:send-horizontal"} className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
