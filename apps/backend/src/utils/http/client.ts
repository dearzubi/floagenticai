import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "../../lib/redis/index.js";
import { logger } from "../logger/index.js";
import {
  NetworkError,
  TimeoutError,
  HttpResponseError,
  RetryExhaustedError,
  ResponseValidationError,
  CacheError,
} from "../errors/http.error.js";
import {
  ExtendedAxiosRequestConfig,
  HttpClientConfig,
  RequestConfig,
  CacheEntry,
} from "./types.js";
import { ZodType } from "zod/v4";

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private config: Required<HttpClientConfig>;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || "",
      timeout: config.timeout || 30000,
      headers: config.headers || {},
      retry: {
        attempts: config.retry?.attempts || 3,
        baseDelay: config.retry?.baseDelay || 1000,
        maxDelay: config.retry?.maxDelay || 30000,
        jitter: config.retry?.jitter || 0.1,
        retryOn: config.retry?.retryOn || [408, 429, 500, 502, 503, 504],
      },
      cache: {
        enabled: config.cache?.enabled || false,
        defaultTTL: config.cache?.defaultTTL || 300,
        keyPrefix: "FA:http_cache:" + (config.cache?.keyPrefix || ""),
      },
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        if (!config.metadata?.requestId) {
          config.metadata = {
            ...config.metadata,
            requestId: uuidv4(),
          };
        }

        logger.debug("HTTP Request", {
          requestId: config.metadata?.requestId,
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
        });

        return config;
      },
      (error) => {
        logger.error("HTTP Request Error", { error: error.message });
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug("HTTP Response", {
          requestId: (response.config as ExtendedAxiosRequestConfig)?.metadata
            ?.requestId,
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        const requestId = (error.config as ExtendedAxiosRequestConfig)?.metadata
          ?.requestId;
        logger.error("HTTP Response Error", {
          requestId,
          error: error.message,
          status: error.response?.status,
          url: error.config?.url,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Calculate delay for exponential backoff with jitter
   */
  private calculateDelay(
    attempt: number,
    config: RequestConfig["retry"],
  ): number {
    const retryConfig = { ...this.config.retry, ...config };
    const baseDelay = retryConfig.baseDelay || 1000;
    const maxDelay = retryConfig.maxDelay || 30000;
    const jitter = retryConfig.jitter || 0.1;

    // Exponential backoff: baseDelay * 2^(attempt - 1)
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, attempt - 1),
      maxDelay,
    );

    // Add jitter: random value between 0 and jitter * exponentialDelay
    const jitterAmount = exponentialDelay * jitter * Math.random();

    return Math.floor(exponentialDelay + jitterAmount);
  }

  private shouldRetry(
    error: AxiosError,
    config: RequestConfig["retry"],
  ): boolean {
    const retryConfig = { ...this.config.retry, ...config };

    // Network errors should always be retried
    if (!error.response) {
      return true;
    }

    return (retryConfig.retryOn || []).includes(error.response.status);
  }

  private generateCacheKey(
    config: AxiosRequestConfig,
    customKey?: string,
  ): string {
    if (customKey) {
      return `${this.config.cache.keyPrefix}${customKey}`;
    }

    const url = `${config.baseURL || ""}${config.url || ""}`;
    const method = config.method?.toUpperCase() || "GET";
    const params = JSON.stringify(config.params || {});
    const data = JSON.stringify(config.data || {});

    return `${this.config.cache.keyPrefix}${method}:${url}:${params}:${data}`;
  }

  private async getCachedResponse<T>(cacheKey: string): Promise<T | null> {
    try {
      const redisClient = await getRedisClient();
      const cached = await redisClient.get(cacheKey);

      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check if cache entry has expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await redisClient.del(cacheKey);
        return null;
      }

      logger.debug("Cache hit", { cacheKey });
      return entry.data;
    } catch (error) {
      logger.warn("Cache read error", {
        cacheKey,
        error: (error as Error).message,
      });
      return null;
    }
  }

  private async setCachedResponse<T>(
    cacheKey: string,
    data: T,
    ttl: number,
  ): Promise<void> {
    try {
      const redisClient = await getRedisClient();
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      await redisClient.setEx(cacheKey, ttl, JSON.stringify(entry));
      logger.debug("Cache set", { cacheKey, ttl });
    } catch (error) {
      logger.warn("Cache write error", {
        cacheKey,
        error: (error as Error).message,
      });
    }
  }

  private validateResponse<T>(
    data: unknown,
    schema?: ZodType<T>,
    requestId?: string,
  ): T {
    if (!schema) {
      return data as T;
    }

    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ResponseValidationError(
          "Response validation failed",
          error.issues,
          "RESPONSE_VALIDATION_ERROR",
          { requestId },
        );
      }
      throw error;
    }
  }

  private async executeWithRetries<T>(
    config: RequestConfig<T>,
  ): Promise<AxiosResponse<T>> {
    const requestId = config.requestId || uuidv4();
    const retryConfig = { ...this.config.retry, ...config.retry };
    const maxAttempts = retryConfig.attempts || 3;

    let lastError: Error = new Error("Unknown error");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const requestConfig: RequestConfig<T> = {
          ...config,
          metadata: { ...config.metadata, requestId, attempt },
        };

        const response = await this.axiosInstance.request<T>(requestConfig);

        if (attempt > 1) {
          logger.info("Request succeeded after retry", { requestId, attempt });
        }

        return response;
      } catch (error) {
        const axiosError = error as AxiosError;
        lastError = error as Error;

        if (axiosError.code === "ECONNABORTED") {
          lastError = new TimeoutError(
            `Request timeout after ${this.config.timeout}ms`,
            this.config.timeout,
            "REQUEST_TIMEOUT",
            axiosError,
            { requestId, url: config.url, method: config.method },
          );
        } else if (!axiosError.response) {
          lastError = new NetworkError(
            axiosError.message || "Network error",
            "NETWORK_ERROR",
            axiosError,
            { requestId, url: config.url, method: config.method },
          );
        } else {
          const response = axiosError.response;
          lastError = new HttpResponseError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            `HTTP_${response.status}`,
            {
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              headers: response.headers as Record<string, string>,
            },
            axiosError,
            { requestId, url: config.url, method: config.method },
          );
        }

        // Check if we should retry
        if (
          attempt < maxAttempts &&
          this.shouldRetry(axiosError, config.retry)
        ) {
          const delay = this.calculateDelay(attempt, config.retry);

          logger.warn("Request failed, retrying", {
            requestId,
            attempt,
            maxAttempts,
            delay,
            error: lastError.message,
          });

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If we reach here, we've exhausted retries or shouldn't retry
        break;
      }
    }

    throw new RetryExhaustedError(
      `Request failed after ${maxAttempts} attempts`,
      maxAttempts,
      lastError,
      "RETRY_EXHAUSTED",
      { requestId, url: config.url, method: config.method },
    );
  }

  async request<T = unknown>(config: RequestConfig<T>): Promise<T> {
    const requestId = config.requestId || uuidv4();
    const cacheConfig = { ...this.config.cache, ...config.cache };

    if (cacheConfig.enabled && config.method?.toUpperCase() === "GET") {
      const cacheKey = this.generateCacheKey(config, config.cache?.key);
      const cached = await this.getCachedResponse<T>(cacheKey);

      if (cached !== null) {
        return this.validateResponse(cached, config.schema, requestId);
      }
    }

    const response = await this.executeWithRetries<T>(config);
    const validatedData = this.validateResponse(
      response.data,
      config.schema,
      requestId,
    );

    if (
      cacheConfig.enabled &&
      config.method?.toUpperCase() === "GET" &&
      response.status >= 200 &&
      response.status < 300
    ) {
      const cacheKey = this.generateCacheKey(config, config.cache?.key);
      const ttl = config.cache?.ttl || cacheConfig.defaultTTL || 300;
      await this.setCachedResponse(cacheKey, validatedData, ttl);
    }

    return validatedData;
  }

  async get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig<T>, "method" | "url">,
  ): Promise<T> {
    return this.request<T>({
      ...config,
      method: "GET",
      url,
    });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig<T>, "method" | "url" | "data">,
  ): Promise<T> {
    return this.request<T>({
      ...config,
      method: "POST",
      url,
      data,
    });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig<T>, "method" | "url" | "data">,
  ): Promise<T> {
    return this.request<T>({
      ...config,
      method: "PUT",
      url,
      data,
    });
  }

  async delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig<T>, "method" | "url">,
  ): Promise<T> {
    return this.request<T>({
      ...config,
      method: "DELETE",
      url,
    });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig<T>, "method" | "url" | "data">,
  ): Promise<T> {
    return this.request<T>({
      ...config,
      method: "PATCH",
      url,
      data,
    });
  }

  async head(
    url: string,
    config?: Omit<RequestConfig, "method" | "url">,
  ): Promise<void> {
    await this.request({
      ...config,
      method: "HEAD",
      url,
    });
  }

  async options<T = unknown>(
    url: string,
    config?: Omit<RequestConfig<T>, "method" | "url">,
  ): Promise<T> {
    return this.request<T>({
      ...config,
      method: "OPTIONS",
      url,
    });
  }

  async clearCache(keyOrPattern?: string): Promise<void> {
    try {
      const redisClient = await getRedisClient();

      if (!keyOrPattern) {
        const pattern = `${this.config.cache.keyPrefix}*`;
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else if (keyOrPattern.includes("*")) {
        const keys = await redisClient.keys(keyOrPattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.del(keyOrPattern);
      }

      logger.debug("Cache cleared", { keyOrPattern });
    } catch (error) {
      throw new CacheError(
        "Failed to clear cache",
        "CACHE_CLEAR_ERROR",
        error as Error,
      );
    }
  }

  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    keyPrefix: string;
  }> {
    try {
      const redisClient = await getRedisClient();
      const pattern = `${this.config.cache.keyPrefix}*`;
      const keys = await redisClient.keys(pattern);
      const info = await redisClient.info("memory");

      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage =
        memoryMatch && memoryMatch[1] ? memoryMatch[1].trim() : "unknown";

      return {
        totalKeys: keys.length,
        memoryUsage,
        keyPrefix: this.config.cache.keyPrefix || "http_cache:",
      };
    } catch (error) {
      throw new CacheError(
        "Failed to get cache statistics",
        "CACHE_STATS_ERROR",
        error as Error,
      );
    }
  }

  updateConfig(newConfig: Partial<HttpClientConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      retry: { ...this.config.retry, ...newConfig.retry },
      cache: { ...this.config.cache, ...newConfig.cache },
    };

    if (newConfig.baseURL) {
      this.axiosInstance.defaults.baseURL = newConfig.baseURL;
    }
    if (newConfig.timeout) {
      this.axiosInstance.defaults.timeout = newConfig.timeout;
    }
    if (newConfig.headers) {
      this.axiosInstance.defaults.headers = {
        ...this.axiosInstance.defaults.headers,
        ...newConfig.headers,
      };
    }
  }

  getConfig(): Required<HttpClientConfig> {
    return { ...this.config };
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const createHttpClient = (config?: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};
