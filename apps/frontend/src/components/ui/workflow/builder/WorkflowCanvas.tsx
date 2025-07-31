import { FC, useState, useEffect } from "react";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import WorkflowNode from "./node/generic";
import WorkflowEdge from "./CustomEdge.tsx";
import { Panel } from "@xyflow/react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import NodesListSidebar from "./nodes-list";
import ConnectionLine from "./ConnectionLine.tsx";
import { useWorkflowCanvas } from "../../../../hooks/workflow/workflow.canvas.hook.ts";
import ChatWindow from "./chat-window";
import { useWorkflowData } from "../../../../hooks/workflow/workflow.data.hook.ts";
import UndoRedo from "./UndoRedo.tsx";
import { useWorkflowCanvasReadOnly } from "../../../../hooks/workflow/workflow.canvas.readonly.hook.ts";
import { useWorkflowStore } from "../../../../stores/workflow.store.ts";

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = {
  workflowEdge: WorkflowEdge,
};

const WorkflowCanvas: FC<{
  readOnly?: boolean;
  initialData?: {
    viewport: { x: number; y: number; zoom: number };
    nodes: Record<string, unknown>[];
    edges: Record<string, unknown>[];
  };
}> = ({ readOnly = false, initialData }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [hasChatTrigger, setHasChatTrigger] = useState(false);

  const setReadOnly = useWorkflowStore((state) => state.setReadOnly);

  const editableCanvasHook = useWorkflowCanvas();
  const readOnlyCanvasHook = useWorkflowCanvasReadOnly(initialData);

  const canvasHook = readOnly ? readOnlyCanvasHook : editableCanvasHook;

  useEffect(() => {
    setReadOnly(readOnly);
    return () => {
      setReadOnly(false);
    };
  }, [readOnly, setReadOnly]);

  const {
    onConnect,
    onDragOver,
    onDrop,
    onNodesChange,
    onEdgesChange,
    nodes,
    edges,
    setReactFlowInstance,
    reactFlowWrapper,
    isValidConnection,
  } = canvasHook;

  const { workflowName, workflowId } = useWorkflowData();

  useEffect(() => {
    const chatTriggerExists = nodes.some(
      (node) => node.data.name === "chat_trigger",
    );
    setHasChatTrigger(chatTriggerExists);

    if (!chatTriggerExists) {
      setShowChatWindow(false);
    }
  }, [nodes]);

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        fitView
        minZoom={0.5}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onInit={(reactFlowInstance) => setReactFlowInstance(reactFlowInstance)}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        connectionLineComponent={readOnly ? undefined : ConnectionLine}
        isValidConnection={readOnly ? undefined : isValidConnection}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        proOptions={{
          hideAttribution: true, // TODO: might need to rethink about this one
        }}
      >
        <Background color="#bbb" gap={16} />
        <Controls />
        {!readOnly && (
          <>
            <Panel position="top-left" className="flex flex-col gap-2">
              <Button
                isIconOnly
                color="primary"
                className="rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none"
                onPress={() => setSidebarOpen(true)}
              >
                <Icon icon="lucide:plus" className="h-5 w-5" />
              </Button>
            </Panel>
            <Panel
              position="bottom-center"
              className="flex flex-row gap-2 !bottom-4"
            >
              {workflowId && <UndoRedo workflowId={workflowId} />}
            </Panel>

            <Panel position="top-right" className="flex flex-col gap-2">
              {hasChatTrigger && (
                <Button
                  isIconOnly
                  color="primary"
                  className="rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none"
                  onPress={() => setShowChatWindow(true)}
                >
                  <Icon icon="lucide:message-circle" className="h-5 w-5" />
                </Button>
              )}
            </Panel>
          </>
        )}
      </ReactFlow>

      {!readOnly && (
        <>
          <NodesListSidebar
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {showChatWindow && hasChatTrigger && workflowId && (
            <ChatWindow
              onClose={() => setShowChatWindow(false)}
              workflowId={workflowId}
              workflowName={workflowName}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkflowCanvas;
