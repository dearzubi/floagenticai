import { FC } from "react";
import { Button as HeroButton, PressEvent, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "../../../../../../utils/ui.ts";
import { getUniqueNodeId } from "../utils.ts";
import { Node, useReactFlow } from "@xyflow/react";
import { WorkflowBuilderUINodeData } from "common";
import { cloneDeep } from "lodash";
import { useWorkflowData } from "../../../../../../hooks/workflow/workflow.data.hook.ts";
import { useWorkflowHistory } from "../../../../../../hooks/workflow/workflow.history.hook.ts";
import { useWorkflowStore } from "../../../../../../stores/workflow.store.ts";

const Button: FC<{
  className?: string;
  onPress: (e: PressEvent) => void;
  icon: string;
  iconColor?: string;
}> = ({ className, onPress, icon, iconColor }) => {
  return (
    <HeroButton
      className={cn(
        "w-fit min-w-fit max-w-fit p-1.5 bg-white rounded-md border-gray-200 border shadow-sm hover:bg-gray-100 transition-all hover:scale-105 hover:border-gray-300 focus:outline-none",
        className,
      )}
      size="sm"
      onPress={onPress}
    >
      <Icon icon={icon} className={cn("h-4 w-4 text-gray-700", iconColor)} />
    </HeroButton>
  );
};

const ConfigButtons: FC<{
  setOpenConfigurationModal: (isOpen: boolean) => void;
  nodeType: string;
  nodeId: string;
  nodeData: WorkflowBuilderUINodeData;
  nodePositionAbsoluteX: number;
  nodePositionAbsoluteY: number;
  nodeWidth?: number;
}> = ({
  setOpenConfigurationModal,
  nodeId,
  nodeType,
  nodeData,
  nodePositionAbsoluteX,
  nodePositionAbsoluteY,
  nodeWidth,
}) => {
  const { deleteElements, getNodes, setNodes, setEdges } = useReactFlow();
  const { workflowId } = useWorkflowData();
  const { saveSnapshot, isApplyingSnapshot } = useWorkflowHistory(workflowId);
  const readOnly = useWorkflowStore((state) => state.readOnly);

  const onRemove = () => {
    if (!isApplyingSnapshot) {
      saveSnapshot(`Removed ${nodeData.friendlyName || nodeData.id}`);
    }
    deleteElements({ nodes: [{ id: nodeId }] });
  };

  const onDuplicate = () => {
    const nodeId = getUniqueNodeId(nodeData, getNodes());
    const idParts = nodeId.split("_");

    const newNodeFriendlyName = `${nodeData.label} ${idParts[idParts.length - 1]}`;

    const newNode = {
      id: nodeId,
      type: nodeType,
      position: {
        x: nodePositionAbsoluteX + (nodeWidth ?? 0) + 50,
        y: nodePositionAbsoluteY,
      },
      data: {
        ...cloneDeep(nodeData),
        id: nodeId,
        friendlyName: newNodeFriendlyName,
      },
    } satisfies Node<WorkflowBuilderUINodeData>;

    if (!isApplyingSnapshot) {
      saveSnapshot(`Duplicated ${nodeData.friendlyName || nodeData.id}`);
    }

    setNodes((nds) => nds.concat([newNode]));
  };

  const onToggleDisable = () => {
    if (!isApplyingSnapshot) {
      saveSnapshot(
        `${nodeData.disabled ? "Enabled" : "Disabled"} ${nodeData.id}`,
      );
    }
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              disabled: !n.data.disabled,
            },
          };
        }
        return n;
      }),
    );

    // Force connected edges to update by re-setting them
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          return { ...edge };
        }
        return edge;
      }),
    );
  };

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex items-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <Tooltip content="Configure" closeDelay={100}>
        <Button
          onPress={() => setOpenConfigurationModal(true)}
          icon="heroicons:cog-6-tooth"
        />
      </Tooltip>

      {!readOnly && (
        <>
          <Tooltip
            content={nodeData.disabled ? "Enable" : "Disable"}
            closeDelay={100}
          >
            <Button
              onPress={onToggleDisable}
              icon={nodeData.disabled ? "lucide:play" : "lucide:pause"}
            />
          </Tooltip>
          <Tooltip content="Duplicate" closeDelay={100}>
            <Button onPress={onDuplicate} icon="lucide:copy" />
          </Tooltip>
          <Tooltip content="Remove" closeDelay={100}>
            <Button
              onPress={onRemove}
              icon="heroicons:trash"
              iconColor={"text-red-500"}
            />
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default ConfigButtons;
