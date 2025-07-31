import { FC } from "react";
import { Icon } from "@iconify/react";

const ChatLoadingIndicator: FC<{
  text: string;
}> = ({ text }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
