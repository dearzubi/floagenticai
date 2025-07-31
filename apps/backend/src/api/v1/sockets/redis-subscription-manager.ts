import { Socket } from "socket.io";
import { getRedisClient } from "../../../lib/redis/index.js";
import { logger } from "../../../utils/logger/index.js";
import { RedisClientType } from "redis";

interface SubscriptionInfo {
  redisClient: RedisClientType;
  channel: string;
  isActive: boolean;
}

class RedisSubscriptionManager {
  private subscriptions = new Map<string, Map<string, SubscriptionInfo>>();

  /**
   * Subscribe to a Redis channel for a specific socket
   * @param socket - Socket.IO socket instance
   * @param redisChannel - Redis channel name
   * @param listener - Callback function to handle incoming messages
   */
  async subscribe(
    socket: Socket,
    redisChannel: string,
    listener: (message: string) => void,
  ): Promise<void> {
    const socketId = socket.id;
    if (this.hasActiveSubscription(socketId, redisChannel)) {
      logger.debug(
        `Redis subscription already exists for channel ${redisChannel}`,
      );
      return;
    }

    try {
      const redisClient = await getRedisClient();
      const subRedisClient = redisClient.duplicate();
      await subRedisClient.connect();

      await subRedisClient.subscribe(redisChannel, listener);

      if (!this.subscriptions.has(socketId)) {
        this.subscriptions.set(socketId, new Map());
      }

      this.subscriptions.get(socketId)?.set(redisChannel, {
        redisClient: subRedisClient,
        channel: redisChannel,
        isActive: true,
      });

      logger.debug(`Created Redis subscription for socket ${redisChannel}`);
    } catch (error) {
      logger.error(`Failed to create Redis subscription: ${error}`);
      throw error;
    }
  }

  /**
   * Check if an active subscription exists
   */
  private hasActiveSubscription(
    socketId: string,
    redisChannel: string,
  ): boolean {
    const socketSubscriptions = this.subscriptions.get(socketId);
    if (!socketSubscriptions) {
      return false;
    }

    const subscription = socketSubscriptions.get(redisChannel);
    return subscription?.isActive === true;
  }

  /**
   * Clean up all subscriptions for a socket
   */
  async cleanupSocketSubscriptions(socketId: string): Promise<void> {
    const socketSubscriptions = this.subscriptions.get(socketId);
    if (!socketSubscriptions) {
      return;
    }

    for (const [key, subscription] of socketSubscriptions.entries()) {
      try {
        await subscription.redisClient.unsubscribe(subscription.channel);
        subscription.redisClient.destroy();
        subscription.isActive = false;
        logger.info(`Cleaned up subscription ${key} for socket ${socketId}`);
      } catch (error) {
        logger.error(`Error cleaning up subscription ${key}: ${error}`);
      }
    }

    this.subscriptions.delete(socketId);
  }

  /**
   * Clean up a specific subscription
   */
  async cleanupSubscription(
    socketId: string,
    redisChannel: string,
  ): Promise<void> {
    const socketSubscriptions = this.subscriptions.get(socketId);
    if (!socketSubscriptions) {
      return;
    }

    const subscription = socketSubscriptions.get(redisChannel);
    if (!subscription) {
      return;
    }

    try {
      await subscription.redisClient.unsubscribe(subscription.channel);
      subscription.redisClient.destroy();
      subscription.isActive = false;
      socketSubscriptions.delete(redisChannel);
      logger.info(
        `Cleaned up subscription ${redisChannel} for socket ${socketId}`,
      );
    } catch (error) {
      logger.error(`Error cleaning up subscription ${redisChannel}: ${error}`);
    }
  }
}

export const redisSubscriptionManager = new RedisSubscriptionManager();
