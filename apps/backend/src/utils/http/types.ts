import { InternalAxiosRequestConfig, AxiosRequestConfig } from "axios";
import { ZodType } from "zod/v4";

export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: RequestMetadata;
}

interface RequestMetadata {
  requestId?: string;
  attempt?: number;
  [key: string]: unknown;
}

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: {
    attempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    /** Jitter factor (0-1) to add randomness to delays */
    jitter?: number;
    /** HTTP status codes that should trigger a retry */
    retryOn?: number[];
  };
  cache?: {
    enabled?: boolean;
    defaultTTL?: number;
    keyPrefix?: string;
  };
}

export interface RequestConfig<T = unknown> extends AxiosRequestConfig {
  schema?: ZodType<T>;
  /** Override retry configuration for this request */
  retry?: {
    attempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    jitter?: number;
    retryOn?: number[];
  };
  /** Override cache configuration for this request */
  cache?: {
    enabled?: boolean;
    ttl?: number;
    key?: string;
  };
  /** Unique request ID for tracking */
  requestId?: string;
  /** Internal metadata for request tracking */
  metadata?: RequestMetadata;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}
