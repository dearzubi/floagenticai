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
        <Icon icon="lucide:search" className="w-4 h-4 text-default-400" />
      }
      className="flex-1"
      size="lg"
      variant="bordered"
    />
  );
};

export default Search;
