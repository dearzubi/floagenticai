import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  APIError,
} from "../errors";
import { firebaseAuth } from "../../lib/firebase";
import { ValidationError } from "../errors";
import { ZodType, ZodError } from "zod/v4";
import { envs } from "../env-schema.ts";

interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  publicAPIOnly?: boolean; //To access only public API endpoints; Don't add auth interceptors
  apiVersion?: number;
}

interface ApiConfigs<T> extends AxiosRequestConfig {
  schema?: ZodType<T>;
}

/**
 * The HttpClient class provides an abstraction over Axios for making HTTP requests
 * with features such as API versioning, authentication, and response validation.
 * It includes support for both public and protected API endpoints.
 */
class HttpClient {
  private axiosInstance: AxiosInstance;
  private publicAPIOnly?: boolean;
  private apiVersion: number = 1;

  constructor(config: HttpClientConfig) {
    if (config.apiVersion) {
      this.apiVersion = config.apiVersion;
    }

    const baseURL =
      config.baseURL.at(config.baseURL.length - 1) === "/"
        ? config.baseURL.slice(0, -1)
        : config.baseURL;

    this.axiosInstance = axios.create({
      baseURL: baseURL + `/v${this.apiVersion}` + "/",
      timeout: config.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.publicAPIOnly = config.publicAPIOnly;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // If public api client then skip adding the auth token
    // Only add if accessing using the http client to access
    // protected API routes
    if (!this.publicAPIOnly) {
      this.axiosInstance.interceptors.request.use(
        async (config) => {
          if (firebaseAuth.currentUser) {
            try {
              const authToken = await firebaseAuth.currentUser.getIdToken();
              config.headers.Authorization = `Bearer ${authToken}`;
            } catch (error) {
              throw new AuthenticationError(
                "Failed to get auth token",
                "AUTH_TOKEN_RETRIEVAL_FAILED",
                false,
                error as Error,
              );
            }
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        },
      );
    }

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (!this.publicAPIOnly && firebaseAuth.currentUser) {
            try {
              const authToken = await firebaseAuth.currentUser.getIdToken(true);
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${authToken}`;
                return this.axiosInstance.request(error.config);
              }
            } catch (refreshError) {
              throw new AuthenticationError(
                "Authentication failed. Please sign in again.",
                "AUTH_TOKEN_REFRESH_FAILED",
                false,
                refreshError as Error,
              );
            }
          }

          throw new AuthenticationError(
            "Authentication failed. Please sign in again.",
          );
        }

        if (error.response?.status === 403) {
          throw new AuthorizationError(
            "Access denied. You don't have permission to perform this action or access this resource.",
            "ACCESS_DENIED",
          );
        }

        if (error.code === "ECONNABORTED") {
          throw new NetworkError(
            "Request timeout",
            "CONNECTION_TIMEOUT",
            undefined,
            error,
          );
        }

        if (!error.response || !error.response.data) {
          throw new NetworkError(
            "Network error. Please check your connection.",
            "NETWORK_ERROR",
            undefined,
            error,
          );
        }

        const errorData = error.response.data as {
          errorCode: string;
          message: string;
          statusCode: number;
          cause?: unknown;
          stack?: string;
        };
        throw new APIError(
          errorData?.message || `HTTP ${error.response.status}`,
          errorData?.errorCode ?? "BAD_API_REQUEST",
          errorData.statusCode,
          typeof errorData?.statusCode === "number" &&
            errorData?.statusCode !== 500,
          {
            cause: errorData.cause,
            stack: errorData.stack,
            ...error.response.headers,
          },
        );
      },
    );
  }

  private validateResponse<T>(data: unknown, schema?: ZodType<T>): T {
    if (schema) {
      try {
        return schema.parse(data);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          throw new ValidationError(
            "API response schema validation failed",
            "API_RESPONSE_VALIDATION_FAILED",
            validationError.issues,
          );
        }
      }
    }
    return data as T;
  }

  async makeRequest<T>(config: ApiConfigs<T>): Promise<T> {
    const response = await this.axiosInstance.request<T>(config);
    return this.validateResponse<T>(response.data, config?.schema);
  }

  // Method to manually set auth token (useful for testing or special cases)
  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * An instance of HttpClient configured for version 1 of the API to access protected routes.
 */
export const apiClientV1 = new HttpClient({
  baseURL: envs.VITE_API_BASE_URL,
  apiVersion: 1,
  publicAPIOnly: false,
});

/**
 * An instance of HttpClient configured for version 1 of the API to access public routes.
 */
export const publicAPIClientV1 = new HttpClient({
  baseURL: envs.VITE_API_BASE_URL,
  apiVersion: 1,
  publicAPIOnly: true,
});
