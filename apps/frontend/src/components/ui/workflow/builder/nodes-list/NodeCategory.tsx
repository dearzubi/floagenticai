import { FC, DragEvent } from "react";
import { motion } from "framer-motion";
import { GroupedNodes } from "../../../../../hooks/workflow/node.hooks.ts";
import { NodeSerialised } from "common";
import NodeItem from "./NodeItem.tsx";

const nodeItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const NodeCategory: FC<{
  category: string;
  filteredNodes: GroupedNodes;
  onDragStart: (event: DragEvent, node: NodeSerialised) => void;
  onDragEnd: () => void;
}> = ({ category, filteredNodes, onDragStart, onDragEnd }) => {
  return (
    <motion.div key={category} variants={nodeItemVariants}>
      <h3 className="text-lg font-semibold mb-3 px-2 text-gray-600 dark:text-gray-300">
        {category}
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {filteredNodes[category].map((node) => (
          <NodeItem
            key={node.name}
            node={node}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default NodeCategory;
