import { FC, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { itemVariants } from "../../ui/mcp/animation.ts";
import Search from "./Search.tsx";
import { cn } from "../../../utils/ui.ts";

const Filters: FC<{
  searchQuery: string;
  handleSearchChange: (value: string) => void;
  selectedCategory: string;
  handleCategoryFilter: (category: string) => void;
  clearFilters: () => void;
  categories: string[];
}> = ({
  searchQuery,
  handleSearchChange,
  selectedCategory,
  handleCategoryFilter,
  clearFilters,
  categories,
}) => {
  const [isCleared, setIsCleared] = useState(false);
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex gap-4 items-center">
        <Search handleSearchChange={handleSearchChange} isCleared={isCleared} />
        {(searchQuery || selectedCategory) && (
          <Button
            color="danger"
            variant="flat"
            size="lg"
            onPress={() => {
              setIsCleared(true);
              clearFilters();
            }}
            startContent={<Icon icon="lucide:x" className="w-4 h-4 " />}
            className={"focus:outline-none hover:border-transparent"}
          >
            Clear
          </Button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-default-700 mr-2">
            Categories:
          </span>
          {categories.map((category) => (
            <Chip
              key={category}
              size="md"
              variant={selectedCategory === category ? "solid" : "bordered"}
              className={cn(
                "cursor-pointer transition-all duration-300 ",
                selectedCategory !== category
                  ? "hover:bg-default-100"
                  : "bg-indigo-500 text-white hover:bg-indigo-500/90",
              )}
              onClick={() => handleCategoryFilter(category)}
              endContent={
                selectedCategory === category && (
                  <Icon icon="lucide:x" className="w-4 h-4 " />
                )
              }
            >
              {category}
            </Chip>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Filters;
