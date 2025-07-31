import { FC } from "react";
import { Icon } from "@iconify/react";

const EmptyChat: FC = () => {
  return (
    <div className="h-full flex items-center justify-center text-gray-500 text-center p-4">
      <div>
        <Icon
          icon="lucide:message-circle"
          className="h-8 w-8 mx-auto mb-2 opacity-40"
        />
        <p>Start a conversation with your workflow</p>
      </div>
    </div>
  );
};

export default EmptyChat;
