export const CHAT_PERFORMANCE_CONFIG = {
  // Socket event batching
  SOCKET_BATCH_DELAY: 20, // Milliseconds to batch socket events

  // Scroll throttling
  SCROLL_THROTTLE_DELAY: 100, // Milliseconds for scroll throttling

  // Content update throttling
  CONTENT_UPDATE_THROTTLE: 16, // ~60fps for content updates
} as const;
