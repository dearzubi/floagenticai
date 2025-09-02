import { FC, useEffect, useState } from "react";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDebounce } from "use-debounce";

const Search: FC<{
  handleSearchChange: (value: string) => void;
  isCleared?: boolean;
}> = ({ handleSearchChange, isCleared }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (!isCleared) {
      handleSearchChange(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (isCleared) {
      setSearchQuery("");
    }
  }, [isCleared]);

  return (
    <Input
      placeholder="Search servers by name, description, or tools..."
      value={searchQuery}
      onValueChange={setSearchQuery}
      startContent={
        <Icon icon="lucide:search" className="w-4 h-4 text-indigo-500" />
      }
      className="flex-1"
      size="lg"
      variant="bordered"
      classNames={{
        inputWrapper:
          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-200 dark:border-gray-700/30 hover:border-indigo-300/100 focus-within:border-indigo-400/100 shadow-md transition-all duration-300",
      }}
    />
  );
};

export default Search;
