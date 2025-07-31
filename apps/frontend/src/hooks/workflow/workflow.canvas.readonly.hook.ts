import {
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { WorkflowBuilderUINodeData } from "common";

const initialNodes: Node<WorkflowBuilderUINodeData>[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowCanvasReadOnly = (initialData?: {
  viewport: { x: number; y: number; zoom: number };
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
}) => {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { setViewport } = useReactFlow();

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      try {
        if (initialData.nodes) {
          setNodes(initialData.nodes as Node<WorkflowBuilderUINodeData>[]);
        }
        if (initialData.edges) {
          setEdges(initialData.edges as Edge[]);
        }

        if (initialData.viewport) {
          // Use setTimeout to ensure the flow is rendered before setting viewport
          setTimeout(() => {
            setViewport(initialData.viewport, { duration: 300 });
          }, 100);
        }
      } catch (error) {
        console.error("Error loading read-only workflow data:", error);
      }
    }
  }, [initialData, setNodes, setEdges, setViewport]);

  // No-op functions for read-only mode
  const noOpFunction = useCallback(() => {}, []);
  const noOpBoolFunction = useCallback(() => false, []);

  const setReactFlowInstance = useCallback(() => {
    // No-op for read-only mode
  }, []);

  return {
    onConnect: noOpFunction,
    onDragOver: noOpFunction,
    onDrop: noOpFunction,
    onNodesChange: noOpFunction,
    onEdgesChange: noOpFunction,
    nodes,
    edges,
    setReactFlowInstance,
    reactFlowWrapper,
    isValidConnection: noOpBoolFunction,
  };
};
