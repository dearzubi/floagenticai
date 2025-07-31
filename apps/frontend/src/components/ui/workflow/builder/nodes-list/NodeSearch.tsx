import { FC } from "react";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react";

const NodeSearch: FC<{
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <Input
        isClearable={true}
        placeholder="Search nodes..."
        value={searchTerm}
        onValueChange={setSearchTerm}
        startContent={<Icon icon="lucide:search" />}
        classNames={{
          clearButton:
            "!bg-transparent !text-gray-500 hover:!text-gray-700 border-none focus:outline-none transition-colors",
        }}
      />
    </div>
  );
};

export default NodeSearch;
