import { FC, PropsWithChildren } from "react";
import { Handle, Position } from "@xyflow/react";
import { Icon } from "@iconify/react";

const Connectors: FC<
  PropsWithChildren<{
    isTrigger: boolean;
    color: string;
  }>
> = ({ children, isTrigger, color }) => {
  return (
    <>
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: color,
            width: 10,
            height: 24,
            left: 1.5,
            borderRadius: 4,
            border: "2px solid white",
            boxShadow: `0 0 6px ${color}90`,
          }}
          className="opacity-100 group-hover:opacity-100 transition-opacity duration-300"
        />
      )}
      {children}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          backgroundColor: color,
          width: 24,
          height: 24,
          right: 2,
          borderRadius: "50%",
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 8px ${color}`,
        }}
        className="opacity-100 group-hover:opacity-100 transition-opacity duration-300"
      >
        <Icon
          icon="lucide:chevron-right"
          className="h-4 w-4 text-white pointer-events-none"
        />
      </Handle>
    </>
  );
};

export default Connectors;
