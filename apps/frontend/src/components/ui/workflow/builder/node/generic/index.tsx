import { FC, useState } from "react";
import { Node as ReactFlowNode, NodeProps } from "@xyflow/react";
import { cn } from "../../../../../../utils/ui.ts";
import { NODE_SETTINGS } from "../constants.ts";
import ConfigurationModal from "./ConfigurationModal.tsx";
import ConfigButtons from "./ConfigButtons.tsx";
import Info from "./Info.tsx";
import Connectors from "./Connectors.tsx";
import RouterConnectors from "./RouterConnectors.tsx";
import { WorkflowBuilderUINodeData } from "common";

const Node: FC<{
  id: NodeProps<ReactFlowNode<WorkflowBuilderUINodeData>>["id"];
  type: NodeProps<ReactFlowNode<WorkflowBuilderUINodeData>>["type"];
  data: NodeProps<ReactFlowNode<WorkflowBuilderUINodeData>>["data"];
  positionAbsoluteX: NodeProps<
    ReactFlowNode<WorkflowBuilderUINodeData>
  >["positionAbsoluteX"];
  positionAbsoluteY: NodeProps<
    ReactFlowNode<WorkflowBuilderUINodeData>
  >["positionAbsoluteY"];
  width?: NodeProps<ReactFlowNode<WorkflowBuilderUINodeData>>["width"];
  selected: NodeProps<ReactFlowNode<WorkflowBuilderUINodeData>>["selected"];
}> = ({ id, type, data, positionAbsoluteX, positionAbsoluteY, width }) => {
  const [openConfigurationModal, setOpenConfigurationModal] = useState(false);

  const color = NODE_SETTINGS[data.name]?.color ?? "#A855F7";

  const isTrigger = data.category?.toLowerCase() === "triggers";

  return (
    <>
      <div
        className={cn("relative group h-full", {
          "opacity-50 grayscale": data.disabled,
        })}
        onDoubleClick={() => setOpenConfigurationModal(true)}
      >
        <ConfigButtons
          setOpenConfigurationModal={setOpenConfigurationModal}
          nodeWidth={width}
          nodeId={id}
          nodeType={type}
          nodeData={data}
          nodePositionAbsoluteX={positionAbsoluteX}
          nodePositionAbsoluteY={positionAbsoluteY}
        />

        {data.name === "router_agent" ? (
          <RouterConnectors color={color} nodeData={data}>
            <Info nodeData={data} />
          </RouterConnectors>
        ) : (
          <Connectors color={color} isTrigger={isTrigger}>
            <Info nodeData={data} />
          </Connectors>
        )}

        <div
          className={cn(
            "absolute -bottom-6 left-1/2 -translate-x-1/2  px-2.5 py-1 text-xs font-mono text-gray-500 transition-all duration-200 pointer-events-none",
            "opacity-0 group-hover:opacity-100",
          )}
        >
          {id}
        </div>
      </div>
      {openConfigurationModal && data && (
        <ConfigurationModal
          openConfigurationModal={openConfigurationModal}
          setOpenConfigurationModal={setOpenConfigurationModal}
          nodeData={data}
          nodeId={id}
        />
      )}
    </>
  );
};

export default Node;
