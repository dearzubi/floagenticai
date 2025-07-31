import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { FC, useMemo, useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { NODE_SETTINGS } from "./node/constants.ts";
import { cn } from "../../../../utils/ui.ts";
import { WorkflowBuilderUINodeData } from "common";
import { useWorkflowStore } from "../../../../stores/workflow.store.ts";

const CustomEdge: FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  animated = false,
}) => {
  const { setEdges, getNode } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const readOnly = useWorkflowStore((state) => state.readOnly);
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  const isDisabled = (sourceNode?.data as WorkflowBuilderUINodeData)?.disabled;

  const [pathString, labelX, labelY] = useMemo(() => {
    const isBackward = targetX < sourceX;
    return isBackward
      ? getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 16,
        })
      : getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
        });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const onRemoveConnection = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const sourceColor =
    (sourceNode &&
      NODE_SETTINGS[(sourceNode.data as WorkflowBuilderUINodeData).name]
        ?.color) ||
    "#A855F7";
  const targetColor =
    (targetNode &&
      NODE_SETTINGS[(targetNode.data as WorkflowBuilderUINodeData).name]
        ?.color) ||
    "#A855F7";

  const gradientId = `edge-gradient-${id}`;

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={sourceColor} />
            <stop offset="100%" stopColor={targetColor} />
          </linearGradient>
        </defs>
      </svg>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn({
          "opacity-50": isDisabled,
        })}
        style={{
          filter: isDisabled ? "grayscale(1)" : undefined,
        }}
      >
        <path
          id={id}
          d={pathString}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={selected ? 6 : 2.5}
          className={animated ? "react-flow__edge-path-animated" : ""}
          style={{
            ...style,
            filter: selected
              ? `drop-shadow(0 0 4px ${sourceColor})`
              : "drop-shadow(0 0 1.5px rgba(0,0,0,0.1))",
          }}
        />

        <BaseEdge
          id={id}
          path={pathString}
          style={{ stroke: "transparent", strokeWidth: 15 }}
        />
        {!readOnly && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: "all",
                zIndex: 1000,
              }}
              className="nodrag nopan"
            >
              <div className={"flex gap-x-2"}>
                <Tooltip
                  content={"Remove Connection"}
                  showArrow={true}
                  closeDelay={200}
                  delay={300}
                >
                  <Button
                    isIconOnly={true}
                    style={{
                      background: `linear-gradient(to right, ${sourceColor}, ${targetColor})`,
                      border: `2px solid ${sourceColor}`,
                      position: "relative",
                      zIndex: 1,
                    }}
                    className={cn(
                      "rounded-full p-1 w-7 h-7 shadow-lg",
                      "transition-all duration-300 ease-in-out",
                      "hover:scale-110",
                      "focus:outline-none",
                      isHovered || selected ? "opacity-100" : "opacity-0",
                      animated && "ring-2 ring-offset-1",
                    )}
                    onPress={() => onRemoveConnection()}
                  >
                    <Icon
                      icon="lucide:unlink"
                      className={"text-white w-full h-full drop-shadow-sm"}
                    />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </EdgeLabelRenderer>
        )}
      </g>
    </>
  );
};

export default CustomEdge;
