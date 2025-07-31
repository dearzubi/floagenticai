import { useCallback, useRef } from "react";
import {
  useWorkflowHistoryStore,
  WorkflowSnapshot,
} from "../../stores/workflow-history.store";
import { useWorkflowStore } from "../../stores/workflow.store.ts";
import { infoToast } from "../../utils/ui.ts";

export const useWorkflowHistory = (workflowId: string | undefined) => {
  const workflowStore = useWorkflowStore();
  const isApplyingRef = useRef<boolean>(false);

  const {
    saveSnapshot: saveSnapshotAction,
    undo: undoAction,
    redo: redoAction,
    canUndo: checkCanUndo,
    canRedo: checkCanRedo,
    resetHistory: resetHistoryAction,
    setApplyingSnapshot,
  } = useWorkflowHistoryStore();

  const createSnapshot = useCallback(
    (description?: string): WorkflowSnapshot | null => {
      if (!workflowStore.reactFlowInstance) {
        return null;
      }
      const reactFlowObject = workflowStore.reactFlowInstance.toObject();

      return {
        nodes: reactFlowObject.nodes,
        edges: reactFlowObject.edges,
        timestamp: Date.now(),
        description,
      };
    },
    [workflowStore.reactFlowInstance],
  );

  const applySnapshot = useCallback(
    (snapshot: WorkflowSnapshot | null) => {
      if (!snapshot || !workflowId || !workflowStore.reactFlowInstance) {
        return;
      }

      // Set flag to prevent saving snapshots during application
      isApplyingRef.current = true;
      setApplyingSnapshot(workflowId, true);

      workflowStore.reactFlowInstance.setNodes(snapshot.nodes);
      workflowStore.reactFlowInstance.setEdges(snapshot.edges);
      if (snapshot.viewport) {
        workflowStore.reactFlowInstance.setViewport(snapshot.viewport);
      }

      // Reset flag after a short delay to ensure all change events have fired
      setTimeout(() => {
        isApplyingRef.current = false;
        setApplyingSnapshot(workflowId, false);
      }, 100);
    },
    [workflowStore.reactFlowInstance, workflowId, setApplyingSnapshot],
  );

  const saveSnapshot = useCallback(
    (description?: string) => {
      const snapshot = createSnapshot(description);
      if (!workflowId || !snapshot) {
        return;
      }
      saveSnapshotAction(workflowId, snapshot);
    },
    [workflowId, createSnapshot, saveSnapshotAction],
  );

  const undo = useCallback(() => {
    const currentSnapshot = createSnapshot();
    if (!workflowId || !currentSnapshot) {
      return;
    }
    const snapshotToRestore = undoAction(workflowId, currentSnapshot);
    if (snapshotToRestore) {
      applySnapshot(snapshotToRestore);
      // Show toast with the description of what was undone
      const message = snapshotToRestore.description
        ? `Undone: ${snapshotToRestore.description}`
        : "Action undone";
      infoToast(message, {
        autoClose: 1000,
        position: "bottom-right",
        hideProgressBar: true,
      });
    }
  }, [workflowId, undoAction, applySnapshot, createSnapshot]);

  const redo = useCallback(() => {
    const currentSnapshot = createSnapshot();
    if (!workflowId || !currentSnapshot) {
      return;
    }
    const snapshotToRestore = redoAction(workflowId, currentSnapshot);
    if (snapshotToRestore) {
      applySnapshot(snapshotToRestore);
      // Show toast with the description of what was redone
      const message = snapshotToRestore.description
        ? `Redone: ${snapshotToRestore.description}`
        : "Action redone";
      infoToast(message, {
        autoClose: 1000,
        position: "bottom-right",
        hideProgressBar: true,
      });
    }
  }, [workflowId, redoAction, applySnapshot, createSnapshot]);

  const resetHistory = useCallback(() => {
    const currentSnapshot = createSnapshot();
    if (!workflowId || !currentSnapshot) {
      return;
    }
    return resetHistoryAction(workflowId, currentSnapshot);
  }, [workflowId, resetHistoryAction, createSnapshot]);

  const canUndo = workflowId ? checkCanUndo(workflowId) : false;
  const canRedo = workflowId ? checkCanRedo(workflowId) : false;

  return {
    saveSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    isApplyingSnapshot: isApplyingRef.current,
  };
};
