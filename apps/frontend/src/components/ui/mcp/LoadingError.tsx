import { FC } from "react";
import { Icon } from "@iconify/react";

const LoadingError: FC<{ errorMessage: string }> = ({ errorMessage }) => {
  return (
    <div className="text-center py-12">
      <Icon
        icon="lucide:alert-circle"
        className="w-16 h-16 text-danger mx-auto mb-4"
      />
      <h2 className="text-xl font-semibold text-danger mb-2">
        Error Loading Servers
      </h2>
      <p className="text-default-500">
        {errorMessage || "Failed to load MCP servers. Please try again."}
      </p>
    </div>
  );
};

export default LoadingError;
