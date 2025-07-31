import { FC } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress, Button } from "@heroui/react";
import NodeSearch from "./NodeSearch.tsx";
import {
  useNodeDragFromList,
  useNodesList,
} from "../../../../../hooks/workflow/node.hooks.ts";
import NodeCategory from "./NodeCategory.tsx";

type NodesListSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};

const NodesListSidebar: FC<NodesListSidebarProps> = ({ isOpen, onClose }) => {
  const { searchTerm, setSearchTerm, isLoading, filteredNodes } = useNodesList({
    isOpen,
  });

  const { isDragging, onDragStart, onDragEnd, handleBackdropClick } =
    useNodeDragFromList({
      onClose,
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/5 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleBackdropClick}
            style={{
              pointerEvents: isDragging ? "none" : "auto",
            }}
          />
          <motion.div
            className="fixed top-0 left-0 h-full w-full max-w-md bg-background text-foreground flex flex-col z-50 shadow-2xl"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col p-4 border-b border-gray-200 dark:border-gray-700 gap-2">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-semibold">Add a node</h2>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onClose}
                  className="focus:outline-none hover:border-transparent"
                >
                  <Icon icon="lucide:x" className="h-5 w-5" />
                </Button>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 dark:bg-primary/20">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="lucide:lightbulb"
                    className="h-4 w-4 flex-shrink-0 text-primary"
                  />
                  <p className="text-xs text-primary-700 dark:text-primary-300">
                    Drag a node from the list and drop it onto the canvas.
                  </p>
                </div>
              </div>
            </div>
            <NodeSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="flex-grow overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex h-full">
                  <Progress
                    isIndeterminate
                    aria-label="Loading..."
                    className="max-w-md"
                    size="sm"
                  />
                </div>
              ) : (
                <motion.div
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.01 } },
                  }}
                >
                  {Object.keys(filteredNodes).length > 0 ? (
                    Object.keys(filteredNodes).map((category) => (
                      <NodeCategory
                        key={category}
                        filteredNodes={filteredNodes}
                        category={category}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No nodes found.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NodesListSidebar;
