import { useWorkflowStore } from "../../stores/workflow.store.ts";
import {
  addEdge,
  Connection,
  Edge,
  EdgeChange,
  getOutgoers,
  Node,
  NodeChange,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { DragEvent, useCallback, useEffect, useRef } from "react";
import { WorkflowBuilderUINodeData } from "common";
import { initReactFlowNodeData } from "../../components/ui/workflow/builder/node/utils.ts";
import { useWorkflowHistory } from "./workflow.history.hook.ts";

const initialNodes: Node<WorkflowBuilderUINodeData>[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowCanvas = () => {
  const setReactFlowInstance = useWorkflowStore(
    (state) => state.setReactFlowInstance,
  );
  const workflow = useWorkflowStore((state) => state.currentWorkflow);
  const setPendingChanges = useWorkflowStore(
    (state) => state.setPendingChanges,
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setViewport, getNodes, getEdges } =
    useReactFlow();

  const { saveSnapshot, isApplyingSnapshot } = useWorkflowHistory(workflow?.id);

  const dragSnapshotRef = useRef<boolean>(false);

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const nodes = getNodes();
      const edges = getEdges();
      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node: Node, visited = new Set()) => {
        if (visited.has(node.id)) {
          return false;
        }

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) {
            return true;
          }
          if (hasCycle(outgoer, visited)) {
            return true;
          }
        }
      };

      if (target?.id === connection.source) {
        return false;
      }
      return !hasCycle(target!);
    },
    [getNodes, getEdges],
  );

  useEffect(() => {
    if (workflow?.serialisedReactFlow) {
      try {
        const flowData = workflow.serialisedReactFlow;

        if (flowData.nodes) {
          setNodes(flowData.nodes as Node<WorkflowBuilderUINodeData>[]);
        }
        if (flowData.edges) {
          setEdges(flowData.edges as Edge[]);
        }

        if (flowData.viewport) {
          // Use setTimeout to ensure the flow is rendered before setting viewport
          setTimeout(() => {
            setViewport(flowData.viewport, { duration: 300 });
          }, 100);
        }
      } catch (error) {
        console.error("Error loading workflow data:", error);
      }
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [workflow?.serialisedReactFlow, setNodes, setEdges, setViewport]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (!isApplyingSnapshot) {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);
        const sourceName =
          sourceNode?.data.friendlyName ||
          sourceNode?.data.label ||
          params.source;
        const targetName =
          targetNode?.data.friendlyName ||
          targetNode?.data.label ||
          params.target;
        saveSnapshot(`Connected "${sourceName}" to "${targetName}"`);
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "workflowEdge",
          },
          eds,
        ),
      );
      setPendingChanges(true);
    },
    [setEdges, setPendingChanges, saveSnapshot, isApplyingSnapshot, nodes],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<WorkflowBuilderUINodeData>>[]) => {
      let shouldSnapshot =
        !isApplyingSnapshot &&
        changes.some(
          (change) => change.type === "add" || change.type === "remove",
        );

      const positionChanges = changes.filter(
        (change) => change.type === "position",
      );

      for (const change of positionChanges) {
        type NodeDragChange = NodeChange<Node<WorkflowBuilderUINodeData>> & {
          dragging?: boolean;
        };

        const dragChange = change as NodeDragChange;

        const isDragStart =
          dragChange.dragging === true && !dragSnapshotRef.current;
        const isDragStop =
          dragChange.dragging === false && dragSnapshotRef.current;

        if (isDragStart && !isApplyingSnapshot) {
          // Capture state BEFORE the drag begins
          shouldSnapshot = true;
          dragSnapshotRef.current = true;
        }

        if (isDragStop) {
          // Reset flag when drag ends so next drag can be captured
          dragSnapshotRef.current = false;
        }
      }

      const hasSignificantChanges = changes.some(
        (change) =>
          change.type === "add" ||
          change.type === "remove" ||
          change.type === "position" ||
          change.type === "dimensions",
      );

      if (shouldSnapshot) {
        // Determine the description based on the change type
        let description = "Modified workflow";
        const removeChanges = changes.filter((c) => c.type === "remove");

        if (removeChanges.length > 0) {
          const removedNode = nodes.find((n) => n.id === removeChanges[0].id);
          const nodeName =
            removedNode?.data.friendlyName ||
            removedNode?.data.label ||
            removeChanges[0].id;
          description = `Removed node "${nodeName}"`;
        } else if (positionChanges.length > 0 && dragSnapshotRef.current) {
          const movedNode = nodes.find((n) => n.id === positionChanges[0].id);
          const nodeName =
            movedNode?.data.friendlyName ||
            movedNode?.data.label ||
            positionChanges[0].id;
          description = `Moved node "${nodeName}"`;
        }

        saveSnapshot(description);
      }

      onNodesChange(changes);

      if (hasSignificantChanges) {
        setPendingChanges(true);
      }
    },
    [onNodesChange, setPendingChanges, saveSnapshot, isApplyingSnapshot, nodes],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const hasSignificantChanges = changes.some((change: EdgeChange) => {
        return (
          change.type === "add" ||
          change.type === "remove" ||
          change.type === "replace"
        );
      });

      if (hasSignificantChanges && !isApplyingSnapshot) {
        let description = "Modified connections";
        const removeChanges = changes.filter((c) => c.type === "remove");

        if (removeChanges.length > 0 && removeChanges[0].id) {
          const removedEdge = edges.find((e) => e.id === removeChanges[0].id);
          if (removedEdge) {
            const sourceNode = nodes.find((n) => n.id === removedEdge.source);
            const targetNode = nodes.find((n) => n.id === removedEdge.target);
            const sourceName =
              sourceNode?.data.friendlyName ||
              sourceNode?.data.label ||
              removedEdge.source;
            const targetName =
              targetNode?.data.friendlyName ||
              targetNode?.data.label ||
              removedEdge.target;
            description = `Disconnected "${sourceName}" from "${targetName}"`;
          }
        }

        saveSnapshot(description);
      }

      onEdgesChange(changes);

      if (hasSignificantChanges) {
        setPendingChanges(true);
      }
    },
    [
      onEdgesChange,
      setPendingChanges,
      saveSnapshot,
      isApplyingSnapshot,
      edges,
      nodes,
    ],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) {
        return;
      }

      const nodeData = event.dataTransfer?.getData("application/reactflow");
      if (!nodeData) {
        return;
      }

      try {
        const { node: droppedNode } = JSON.parse(nodeData) as {
          node: WorkflowBuilderUINodeData;
        };

        if (!isApplyingSnapshot) {
          const nodeName =
            droppedNode.friendlyName || droppedNode.label || droppedNode.name;
          saveSnapshot(`Added node "${nodeName}"`);
        }

        const position = screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const reactFlowNodeData = initReactFlowNodeData(droppedNode, nodes);

        const newNode: Node<WorkflowBuilderUINodeData> = {
          id: reactFlowNodeData.id,
          type: "workflowNode",
          position,
          draggable: true,
          data: reactFlowNodeData,
        };
        setNodes((nds) => nds.concat([newNode]));
        setPendingChanges(true);
      } catch (error) {
        console.error("Error parsing dropped node data:", error);
      }
    },
    [
      screenToFlowPosition,
      nodes,
      setNodes,
      setPendingChanges,
      saveSnapshot,
      isApplyingSnapshot,
    ],
  );

  return {
    onConnect,
    onDragOver,
    onDrop,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    nodes,
    edges,
    setReactFlowInstance,
    reactFlowWrapper,
    isValidConnection,
  };
};
