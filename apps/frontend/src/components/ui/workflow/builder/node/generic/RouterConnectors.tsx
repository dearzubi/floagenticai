import {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { Icon } from "@iconify/react";
import { WorkflowBuilderUINodeData } from "common";
import { Tooltip } from "@heroui/react";

interface RouterConnectorsProps extends PropsWithChildren {
  color: string;
  nodeData: WorkflowBuilderUINodeData;
}

const HANDLE_SIZE = 20; // px – diameter of a circular handle
const HANDLE_GAP = 8; // px – desired vertical gap between handles
// Minimum content height (matches approx Info card height)
const MIN_NODE_HEIGHT = 60; // px

const RouterConnectors: FC<RouterConnectorsProps> = ({
  children,
  color,
  nodeData,
}) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const prevConditionsRef = useRef<typeof conditions>([]);
  const prevConditionIdsRef = useRef<string[]>([]);

  const { conditions } = useMemo(() => {
    const currentVersion = nodeData.versions.find(
      (v) => v.version === nodeData.currentVersion,
    );
    const inputs = currentVersion?.inputs as {
      router_configurations: {
        routing_configurations: {
          conditions: { id: string; name: string; expression: string }[];
        };
      };
    };
    const conditions =
      inputs?.router_configurations?.routing_configurations?.conditions || [];
    return { conditions };
  }, [nodeData.versions, nodeData.currentVersion]);

  const requiredHeight = useMemo(() => {
    return Math.max(
      MIN_NODE_HEIGHT,
      conditions.length * (HANDLE_SIZE + HANDLE_GAP) + HANDLE_GAP,
    );
  }, [conditions.length]);

  const getHandlePosition = useCallback((index: number, total: number) => {
    return ((index + 1) * 100) / (total + 1);
  }, []);

  const conditionsChanged = useMemo(() => {
    const changed =
      JSON.stringify(conditions) !== JSON.stringify(prevConditionsRef.current);
    if (changed) {
      prevConditionsRef.current = conditions;
    }
    return changed;
  }, [conditions]);

  const conditionIdsChanged = useMemo(() => {
    const currentIds = conditions.map((c) => c.id);
    const prevIds = prevConditionIdsRef.current;

    const idsChanged =
      currentIds.length !== prevIds.length ||
      currentIds.some((id, index) => id !== prevIds[index]);

    if (idsChanged) {
      prevConditionIdsRef.current = currentIds;
    }

    return idsChanged;
  }, [conditions]);

  useEffect(() => {
    if (
      conditionsChanged ||
      conditions.length !== prevConditionsRef.current.length ||
      conditionIdsChanged
    ) {
      updateNodeInternals(nodeData.id);
    }
  }, [
    conditionsChanged,
    conditions.length,
    conditionIdsChanged,
    nodeData.id,
    updateNodeInternals,
  ]);

  return (
    <div className={"flex"}>
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

      <div
        style={{ minHeight: requiredHeight, height: requiredHeight }}
        className="flex h-full items-stretch"
      >
        {children}
      </div>

      {conditions.length > 0
        ? conditions.map((condition, index) => (
            <Tooltip
              key={condition.id}
              content={condition.name}
              closeDelay={100}
              placement="right"
            >
              <Handle
                id={condition.id}
                type="source"
                position={Position.Right}
                style={{
                  backgroundColor: color,
                  width: 20,
                  height: 20,
                  right: 2,
                  top: `${getHandlePosition(index, conditions.length)}%`,
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
                  className="h-3 w-3 text-white pointer-events-none"
                />
              </Handle>
            </Tooltip>
          ))
        : null}
    </div>
  );
};

export default RouterConnectors;
