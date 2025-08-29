import { FC } from "react";
import { Icon } from "@iconify/react";

const NoServers: FC<{
  activeTab: "installed" | "available";
  searchQuery: string;
  selectedCategory: string;
}> = ({ activeTab, selectedCategory, searchQuery }) => {
  return (
    <div className="text-center py-12">
      <Icon
        icon={
          activeTab === "installed" ? "lucide:package-x" : "lucide:search-x"
        }
        className="w-16 h-16 text-default-400 mx-auto mb-4"
      />
      <h2 className="text-xl font-semibold text-default-600 mb-2">
        {activeTab === "installed"
          ? "No Installed Servers"
          : "No Servers Found"}
      </h2>
      <p className="text-default-500">
        {activeTab === "installed"
          ? searchQuery || selectedCategory
            ? "No installed servers match your filters"
            : "You haven't installed any MCP servers yet. Switch to Available Servers to get started."
          : searchQuery || selectedCategory
            ? "Try adjusting your search or filters"
            : "No MCP servers are currently available"}
      </p>
    </div>
  );
};

export default NoServers;
