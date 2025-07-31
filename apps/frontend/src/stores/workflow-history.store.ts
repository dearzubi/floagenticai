import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { Edge, Node } from "@xyflow/react";
import superjson from "superjson";
import { WorkflowBuilderUINodeData } from "common";

export interface WorkflowSnapshot {
  nodes: Node<WorkflowBuilderUINodeData>[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
  timestamp: number;
  description?: string;
}

interface WorkflowHistory {
  undoStack: WorkflowSnapshot[];
  redoStack: WorkflowSnapshot[];
  isApplyingSnapshot: boolean;
  skipApplySnapshot?: boolean;
}

interface WorkflowHistoryState {
  histories: Map<string, WorkflowHistory>;
  maxHistorySize: number;
}

interface WorkflowHistoryActions {
  saveSnapshot: (workflowId: string, snapshot: WorkflowSnapshot) => void;
  undo: (
    workflowId: string,
    currentSnapshot: WorkflowSnapshot,
  ) => WorkflowSnapshot | null;
  redo: (
    workflowId: string,
    currentSnapshot: WorkflowSnapshot,
  ) => WorkflowSnapshot | null;
  resetHistory: (
    workflowId: string,
    currentSnapshot: WorkflowSnapshot,
  ) => Promise<void>;
  canUndo: (workflowId: string) => boolean;
  canRedo: (workflowId: string) => boolean;
  getWorkflowHistory: (workflowId: string) => WorkflowHistory | null;
  isApplyingSnapshot: (workflowId: string) => boolean;
  setApplyingSnapshot: (workflowId: string, value: boolean) => void;
}

const storage: PersistStorage<WorkflowHistoryState & WorkflowHistoryActions> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) {
      return null;
    }
    return superjson.parse(str);
  },
  setItem: (name, value) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

const areSnapshotsEqual = (
  snapshotA: WorkflowSnapshot,
  snapshotB: WorkflowSnapshot,
) => {
  return (
    superjson.stringify(snapshotA.nodes) ===
      superjson.stringify(snapshotB.nodes) &&
    superjson.stringify(snapshotA.edges) ===
      superjson.stringify(snapshotB.edges)
  );
};

export const useWorkflowHistoryStore = create<
  WorkflowHistoryState & WorkflowHistoryActions
>()(
  persist(
    (set, get) => ({
      histories: new Map(),
      maxHistorySize: 50,

      saveSnapshot: (workflowId: string, snapshot: WorkflowSnapshot) => {
        set((state) => {
          const newHistories = new Map(state.histories);
          const workflowHistory = newHistories.get(workflowId) || {
            undoStack: [],
            redoStack: [],
            isApplyingSnapshot: false,
          };

          // Don't save snapshots when we're applying a snapshot (undo/redo)
          if (workflowHistory.isApplyingSnapshot) {
            return state;
          }

          const lastSnapshot = workflowHistory.undoStack.at(-1);

          const newUndoStack = [...workflowHistory.undoStack];

          if (
            lastSnapshot &&
            // Handles the case where initial workflow state is the same as the first snapshot
            // We'll duplicate the existing snapshot in the undo stack in the next step
            // The first snapshot act as checkpoint after the save, we don't want to undo that snapshot
            workflowHistory.undoStack.length > 1 &&
            areSnapshotsEqual(lastSnapshot, snapshot)
          ) {
            return state;
          }

          newUndoStack.push(snapshot);

          if (newUndoStack.length > state.maxHistorySize) {
            newUndoStack.shift();
          }

          newHistories.set(workflowId, {
            undoStack: newUndoStack,
            redoStack: [], // Clear redo stack on when user makes a manual change to the workflow
            isApplyingSnapshot: false,
          });

          return { histories: newHistories };
        });
      },

      undo: (workflowId: string, currentSnapshot: WorkflowSnapshot) => {
        const state = get();
        const workflowHistory = state.histories.get(workflowId);

        if (!workflowHistory || workflowHistory.undoStack.length <= 1) {
          return null;
        }

        const newRedoStack = [...workflowHistory.redoStack, currentSnapshot];

        if (newRedoStack.length > state.maxHistorySize) {
          newRedoStack.shift();
        }

        const newUndoStack = [...workflowHistory.undoStack];
        const snapshotToRestore = newUndoStack.pop()!;

        set((state) => {
          const newHistories = new Map(state.histories);
          newHistories.set(workflowId, {
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            isApplyingSnapshot: true,
          });
          return { histories: newHistories };
        });

        return snapshotToRestore;
      },

      redo: (workflowId: string, currentSnapshot: WorkflowSnapshot) => {
        const state = get();
        const workflowHistory = state.histories.get(workflowId);

        if (!workflowHistory || workflowHistory.redoStack.length === 0) {
          return null;
        }

        const newUndoStack = [...workflowHistory.undoStack, currentSnapshot];

        const newRedoStack = [...workflowHistory.redoStack];
        const snapshotToRestore = newRedoStack.pop()!;

        set((state) => {
          const newHistories = new Map(state.histories);
          newHistories.set(workflowId, {
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            isApplyingSnapshot: true,
          });
          return { histories: newHistories };
        });

        return snapshotToRestore;
      },

      resetHistory: (workflowId, currentSnapshot) =>
        new Promise<void>((resolve) => {
          set((state) => {
            const newHistories = new Map(state.histories);
            // Force a new object reference to ensure persistence layer detects the change
            newHistories.set(workflowId, {
              undoStack: [currentSnapshot],
              redoStack: [],
              isApplyingSnapshot: false,
            });
            // Return a new Map to ensure state change is detected
            return { histories: new Map(newHistories) };
          });
          // Add a small delay to ensure persistence completes
          setTimeout(resolve, 50);
        }),

      canUndo: (workflowId: string) => {
        const state = get();
        const workflowHistory = state.histories.get(workflowId);
        return workflowHistory ? workflowHistory.undoStack.length > 1 : false;
      },

      canRedo: (workflowId: string) => {
        const state = get();
        const workflowHistory = state.histories.get(workflowId);
        return workflowHistory ? workflowHistory.redoStack.length > 0 : false;
      },

      getWorkflowHistory: (workflowId: string) => {
        const state = get();
        return state.histories.get(workflowId) || null;
      },

      isApplyingSnapshot: (workflowId: string) => {
        const state = get();
        const workflowHistory = state.histories.get(workflowId);
        return workflowHistory ? workflowHistory.isApplyingSnapshot : false;
      },
      setApplyingSnapshot: (workflowId: string, value: boolean) => {
        set((state) => {
          const newHistories = new Map(state.histories);
          const workflowHistory = newHistories.get(workflowId);
          if (workflowHistory) {
            newHistories.set(workflowId, {
              ...workflowHistory,
              isApplyingSnapshot: value,
            });
          }
          return { histories: newHistories };
        });
      },
    }),
    {
      name: "workflow-history",
      storage,
    },
  ),
);
