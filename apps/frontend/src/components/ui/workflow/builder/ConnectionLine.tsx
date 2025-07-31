import {
  BaseEdge,
  getBezierPath,
  ConnectionLineComponentProps,
  getSmoothStepPath,
} from "@xyflow/react";
import { FC, useMemo } from "react";
import { NODE_SETTINGS } from "./node/constants.ts";
import { WorkflowBuilderUINodeData } from "common";

const ConnectionLine: FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}) => {
  const [edgePath] = useMemo(() => {
    const isBackward = toX < fromX;
    return isBackward
      ? getSmoothStepPath({
          sourceX: fromX + 10,
          sourceY: fromY,
          sourcePosition: fromPosition,
          targetX: toX,
          targetY: toY,
          targetPosition: toPosition,
          borderRadius: 16,
        })
      : getBezierPath({
          sourceX: fromX + 10,
          sourceY: fromY,
          targetX: toX,
          targetY: toY,
          sourcePosition: fromPosition,
          targetPosition: toPosition,
        });
  }, [fromX, fromY, toX, toY, fromPosition, toPosition]);

  const color =
    NODE_SETTINGS[(fromNode.data as WorkflowBuilderUINodeData).name].color;

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: color,
        strokeWidth: "3px",
      }}
      className="animated"
    />
  );
};

export default ConnectionLine;
