import { io, Socket } from "socket.io-client";
import { firebaseAuth } from "../../lib/firebase";
import { IServerError } from "common";

export type SocketEventCallback<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private readonly url: string;
  private readonly eventCallbacks: Map<
    string,
    Set<SocketEventCallback<unknown>>
  > = new Map();

  constructor(url: string = import.meta.env.VITE_SOCKET_URL) {
    this.url = url;
  }

  /**
   * Establish a socket connection (idempotent).
   * @param forceReconnect – If true, any existing connection is closed first.
   */
  async connect(forceReconnect = false): Promise<Socket> {
    if (forceReconnect && this.socket) {
      this.disconnect();
    }

    if (!this.socket) {
      const authToken = (await firebaseAuth.currentUser?.getIdToken()) ?? "";

      this.socket = io(this.url, {
        auth: { authToken },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1_000,
        reconnectionAttempts: 5,
        timeout: 20_000,
        transports: ["websocket", "polling"],
      });

      this.attachInternalListeners();

      this.registerStoredEvents();
    }

    return this.socket;
  }

  /**
   * Attaches core connection lifecycle listeners.
   */
  private attachInternalListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on("connect", () => {
      console.log("🔌 Connected to server:", this.socket?.id);
      this.notifyCallbacks("socket:connect", { socketId: this.socket?.id });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from server:", reason);
      this.notifyCallbacks("socket:disconnect", { reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Connection error:", error);
      this.notifyCallbacks("socket:error", { error: error.message });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.notifyCallbacks("socket:disconnect", { reason: "manual" });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  emit<TRequest = unknown, TResponse = unknown>(
    event: string,
    data?: TRequest,
  ): Promise<TResponse | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      let isResolved = false;

      this.socket.emit(
        event,
        data,
        (response: TResponse & { error?: IServerError }) => {
          if (isResolved) {
            return;
          }
          isResolved = true;

          if (response && typeof response === "object" && "error" in response) {
            reject(response.error);
          } else {
            resolve(response);
          }
        },
      );

      setTimeout(() => {
        if (isResolved) {
          return;
        }
        isResolved = true;
        reject(new Error(`Socket emit timeout for event: ${event}`));
      }, 30_000);
    });
  }

  on<T = unknown>(event: string, callback: SocketEventCallback<T>): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks
      .get(event)!
      .add(callback as SocketEventCallback<unknown>);

    if (this.socket) {
      this.socket.on(event, callback as SocketEventCallback<unknown>);
    }
  }

  off<T = unknown>(event: string, callback?: SocketEventCallback<T>): void {
    if (callback) {
      this.eventCallbacks
        .get(event)
        ?.delete(callback as SocketEventCallback<unknown>);
      if (this.socket) {
        this.socket.off(event, callback as SocketEventCallback<unknown>);
      }
    } else {
      // Remove all listeners for this event
      this.eventCallbacks.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  private notifyCallbacks<T = unknown>(event: string, data: T): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) =>
        (callback as SocketEventCallback<T>)(data),
      );
    }
  }

  // Re-register all stored events when socket reconnects
  private registerStoredEvents(): void {
    if (!this.socket) {
      return;
    }

    this.eventCallbacks.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket!.on(event, callback as SocketEventCallback<unknown>);
      });
    });
  }
}

export const socketService = new SocketService();
export default socketService;
