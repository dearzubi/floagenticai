import { ReactFlowInstance, Node, Edge } from "@xyflow/react";
import { create } from "zustand/index";
import { WorkflowBuilderUINodeData } from "common";
import { WorkflowAPIResponse } from "../apis/workflow/schemas.ts";

interface WorkflowStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  currentWorkflow: WorkflowAPIResponse | null;
  setCurrentWorkflow: (currentWorkflow: WorkflowAPIResponse | null) => void;
  pendingChanges: boolean;
  setPendingChanges: (pendingChanges: boolean) => void;
  readOnly: boolean;
  setReadOnly: (readOnly: boolean) => void;
  reactFlowInstance: ReactFlowInstance<
    Node<WorkflowBuilderUINodeData>,
    Edge
  > | null;
  setReactFlowInstance: (
    reactFlowInstance: ReactFlowInstance<
      Node<WorkflowBuilderUINodeData>,
      Edge
    > | null,
  ) => void;
  reset: () => void;
}

/**
 * A Zustand store that manages the state of a workflow.
 *
 * This store contains the following state properties and methods:
 *
 * State Properties:
 * - `isLoading`: A boolean indicating whether loading is in progress.
 * - `currentWorkflow`: The current workflow object or null if none is selected.
 * - `reactFlowInstance`: The ReactFlow instance associated with the workflow, or null if not set.
 * - `pendingChanges`: A boolean indicating whether there are any unsaved changes.
 * - `readOnly`: A boolean indicating whether the workflow is in read-only mode.
 *
 * Methods:
 * - `setIsLoading(isLoading)`: Updates the `isLoading` state.
 * - `setReactFlowInstance(reactFlowInstance)`: Sets or clears the `reactFlowInstance` state.
 * - `setPendingChanges(pendingChanges)`: Updates the `pendingChanges` state.
 * - `setCurrentWorkflow(currentWorkflow)`: Updates the `currentWorkflow` with the provided value.
 * - `setReadOnly(readOnly)`: Updates the `readOnly` state.
 * - `reset()`: Resets all state properties to their default initial values.
 */
export const useWorkflowStore = create<WorkflowStore>()((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set(() => ({ isLoading })),
  currentWorkflow: null,
  reactFlowInstance: null,
  pendingChanges: false,
  readOnly: false,
  setReadOnly: (readOnly) => set(() => ({ readOnly })),
  setReactFlowInstance: (reactFlowInstance) =>
    set(() => {
      return { reactFlowInstance: reactFlowInstance ?? null };
    }),
  setPendingChanges: (pendingChanges) =>
    set(() => {
      return { pendingChanges };
    }),
  setCurrentWorkflow: (currentWorkflow) =>
    set(() => {
      return { currentWorkflow };
    }),
  reset: () =>
    set(() => ({
      isLoading: false,
      currentWorkflow: null,
      reactFlowInstance: null,
      pendingChanges: false,
      readOnly: false,
    })),
}));
