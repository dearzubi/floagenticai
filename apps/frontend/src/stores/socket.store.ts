import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { Socket } from "socket.io-client";
import socketService from "../utils/socket/socket-service";
import { useShallow } from "zustand/shallow";
import { WorkflowNodeExecutionEvent } from "common";
import { ChatListAPIResponse } from "../apis/chat/schemas.ts";
import { CHAT_PERFORMANCE_CONFIG } from "../components/ui/workflow/builder/chat-window/config.ts";
import { ApprovalResult } from "../components/ui/workflow/builder/chat-window/ApprovalSubmissionBar.tsx";

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  reconnectAttempts: number;

  connect: () => Promise<void>;
  disconnect: () => void;

  setConnectionState: (connected: boolean, error?: string) => void;
  setConnecting: (connecting: boolean) => void;

  workflowNodeExecutionQueue: Map<string, WorkflowNodeExecutionEvent[]>;
  enqueueWorkflowNodeExecutionEvent: (
    event: WorkflowNodeExecutionEvent,
  ) => void;
  dequeueWorkflowNodeExecutionEvent: (workflowId: string) => void;
  removeEventFromQueue: (event: WorkflowNodeExecutionEvent) => void;
  clearWorkflowNodeExecutionQueue: (workflowId: string) => void;

  triggerChat: (payload: {
    workflowId: string;
    userMessage: string;
  }) => Promise<ChatListAPIResponse[number] | null>;

  submitToolApprovals: (payload: {
    workflowId: string;
    approvalResults: ApprovalResult[];
  }) => Promise<{ ok: boolean } | null>;

  batchedEvents: Map<string, WorkflowNodeExecutionEvent[]>;
  batchTimeout: Map<string, NodeJS.Timeout>;

  batchWorkflowNodeExecutionEvent: (event: WorkflowNodeExecutionEvent) => void;
  processBatchedEvents: (workflowId: string) => void;
}

export const useSocketStore = create<SocketStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      socket: null,
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      reconnectAttempts: 0,
      workflowNodeExecutionQueue: new Map(),
      batchedEvents: new Map(),
      batchTimeout: new Map(),

      connect: async () => {
        const store = get();

        if (store.isConnecting || store.isConnected) {
          return;
        }

        try {
          store.setConnecting(true);
          store.setConnectionState(false, undefined);

          const socket = await socketService.connect();
          set({ socket });

          socketService.on("socket:connect", () => {
            store.setConnectionState(true);
            store.setConnecting(false);
          });

          socketService.on("socket:disconnect", () => {
            store.setConnectionState(false);
            store.setConnecting(false);
          });

          socketService.on<{ error: string }>("socket:error", (data) => {
            store.setConnectionState(false, data.error);
            store.setConnecting(false);
          });

          socketService.on<WorkflowNodeExecutionEvent>(
            "workflow:execution:update",
            (event) => {
              get().batchWorkflowNodeExecutionEvent(event);
            },
          );
        } catch (error) {
          console.error("Failed to connect socket:", error);
          store.setConnecting(false);
          store.setConnectionState(
            false,
            error instanceof Error ? error.message : "Connection failed",
          );
        }
      },

      disconnect: () => {
        socketService.disconnect();
        set({
          socket: null,
          isConnected: false,
          isConnecting: false,
          connectionError: null,
          reconnectAttempts: 0,
        });
      },

      setConnectionState: (connected: boolean, error?: string) => {
        set((state) => ({
          isConnected: connected,
          connectionError: error || null,
          reconnectAttempts: connected ? 0 : state.reconnectAttempts + 1,
        }));
      },

      setConnecting: (connecting: boolean) => {
        set({ isConnecting: connecting });
      },

      enqueueWorkflowNodeExecutionEvent: (event) =>
        set((state) => {
          const next = new Map(state.workflowNodeExecutionQueue);
          const list = next.get(event.workflowId) ?? [];
          next.set(event.workflowId, [...list, event]);
          return { workflowNodeExecutionQueue: next };
        }),

      dequeueWorkflowNodeExecutionEvent: (workflowId) =>
        set((state) => {
          const next = new Map(state.workflowNodeExecutionQueue);
          const list = next.get(workflowId) ?? [];
          if (list.length) {
            next.set(workflowId, list.slice(1));
          }
          return { workflowNodeExecutionQueue: next };
        }),

      removeEventFromQueue: (event) =>
        set((state) => {
          const next = new Map(state.workflowNodeExecutionQueue);
          const list = (next.get(event.workflowId) ?? []).filter(
            (e) => e !== event,
          );
          next.set(event.workflowId, list);
          return { workflowNodeExecutionQueue: next };
        }),

      clearWorkflowNodeExecutionQueue: (workflowId) =>
        set((state) => {
          const next = new Map(state.workflowNodeExecutionQueue);
          next.set(workflowId, []);
          return { workflowNodeExecutionQueue: next };
        }),

      triggerChat: async ({ workflowId, userMessage }) =>
        socketService.emit<
          { workflowId: string; userMessage: string },
          ChatListAPIResponse[number]
        >("workflow:chat:trigger", {
          workflowId,
          userMessage,
        }),

      batchWorkflowNodeExecutionEvent: (event) => {
        const store = get();
        const { workflowId } = event;

        set((state) => {
          const next = new Map(state.batchedEvents);
          const list = next.get(workflowId) ?? [];
          next.set(workflowId, [...list, event]);
          return { batchedEvents: next };
        });

        const existingTimeout = store.batchTimeout.get(workflowId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const newTimeout = setTimeout(() => {
          store.processBatchedEvents(workflowId);
        }, CHAT_PERFORMANCE_CONFIG.SOCKET_BATCH_DELAY);

        set((state) => {
          const next = new Map(state.batchTimeout);
          next.set(workflowId, newTimeout);
          return { batchTimeout: next };
        });
      },

      processBatchedEvents: (workflowId) => {
        const store = get();
        const events = store.batchedEvents.get(workflowId) ?? [];

        if (events.length === 0) {
          return;
        }

        set((state) => {
          const next = new Map(state.batchedEvents);
          next.set(workflowId, []);
          return { batchedEvents: next };
        });

        events.forEach((event) => {
          store.enqueueWorkflowNodeExecutionEvent(event);
        });

        set((state) => {
          const next = new Map(state.batchTimeout);
          next.delete(workflowId);
          return { batchTimeout: next };
        });
      },

      submitToolApprovals: async ({ workflowId, approvalResults }) =>
        socketService.emit<
          {
            workflowId: string;
            approvalResults: ApprovalResult[];
          },
          { ok: boolean }
        >("workflow:agent:tool:approval", {
          workflowId,
          approvalResults,
        }),
    })),
    {
      name: "socket-store",
    },
  ),
);

export const useSocketConnection = () =>
  useSocketStore(
    useShallow((state) => ({
      socket: state.socket,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      connectionError: state.connectionError,
      reconnectAttempts: state.reconnectAttempts,
      connect: state.connect,
      disconnect: state.disconnect,
    })),
  );

export const useWorkflowNodeExecutionSocketEvent = () =>
  useSocketStore(
    useShallow((state) => ({
      workflowNodeExecutionQueue: state.workflowNodeExecutionQueue,
      dequeueWorkflowNodeExecutionEvent:
        state.dequeueWorkflowNodeExecutionEvent,
      removeEventFromQueue: state.removeEventFromQueue,
      clearWorkflowNodeExecutionQueue: state.clearWorkflowNodeExecutionQueue,
    })),
  );

export const useTriggerChat = () =>
  useSocketStore((state) => state.triggerChat);
