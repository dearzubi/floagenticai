import { DragEvent, FC } from "react";
import { Icon } from "@iconify/react";
import { NODE_SETTINGS } from "../node/constants.ts";
import { NodeSerialised } from "common";

const NodeItem: FC<{
  node: NodeSerialised;
  onDragStart: (event: DragEvent, node: NodeSerialised) => void;
  onDragEnd: () => void;
}> = ({ node, onDragStart, onDragEnd }) => {
  return (
    <div
      key={node.name}
      className="p-2 border dark:border-gray-700 rounded-lg flex items-center gap-4 cursor-grab hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      onDragStart={(event) => onDragStart(event, node)}
      onDragEnd={() => onDragEnd()}
      draggable
    >
      <div className="dark:bg-gray-800 p-1 rounded-md">
        <Icon
          icon={NODE_SETTINGS[node.name]?.icon}
          width="28"
          className="text-gray-100 dark:text-gray-300"
          color={NODE_SETTINGS[node.name]?.color}
        />
      </div>
      <div>
        <div className="font-semibold">{node.label}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {node.description}
        </div>
      </div>
    </div>
  );
};

export default NodeItem;
