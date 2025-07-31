import { FC } from "react";

const ChatHistoryError: FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center px-2">
      <p className="text-sm text-danger-500 text-center">
        Something went wrong. Failed to load chat. Please close and reopen the
        chat window or refresh the page.
      </p>
    </div>
  );
};

export default ChatHistoryError;
