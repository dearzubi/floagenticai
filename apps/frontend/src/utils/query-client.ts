import { QueryClient } from "@tanstack/react-query";
import {
  AuthenticationError,
  NetworkError,
  APIError,
  AuthorizationError,
  ValidationError,
} from "./errors/";
import { AxiosError } from "axios";
import { errorToast } from "./ui.ts";

/**
 * TanStack Query Client.
 *
 * Defaults:
 * - gcTime: 10 minutes
 * - Retry Delay:
 *   - Min: 1 sec
 *   - Max: 30 sec
 * - Retry Jitter: 10%
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth and validation errors
        if (
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError ||
          error instanceof ValidationError
        ) {
          return false;
        }

        // Don't retry on client errors (4xx)
        if (
          error instanceof APIError &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }

        // Don't retry on axios errors that are client errors
        if (
          error instanceof AxiosError &&
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }

        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 0.1; // 10% jitter
        return baseDelay * (1 + jitter);
      },
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on auth and validation errors
        if (
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError ||
          error instanceof ValidationError
        ) {
          return false;
        }

        // Don't retry on client errors (4xx)
        if (
          error instanceof APIError &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }

        // Don't retry on axios errors that are client errors
        if (
          error instanceof AxiosError &&
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }

        // Retry once for network errors
        if (error instanceof NetworkError) {
          return failureCount < 1;
        }

        return false;
      },
      onError: (error) => {
        handleGlobalError(error);
      },
    },
  },
});

function handleGlobalError(error: unknown) {
  console.error("Query error:", error);

  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError
  ) {
    errorToast(error.message);
    // Optionally redirect to login or trigger auth flow
    // window.location.href = '/login';
    return;
  }

  if (error instanceof ValidationError) {
    errorToast("Invalid data received from server. Please try again.");
    return;
  }

  if (error instanceof NetworkError) {
    errorToast("Network error. Please check your connection and try again.");
    return;
  }

  if (error instanceof APIError) {
    if (error.statusCode >= 500) {
      errorToast("Server error. Please try again later.");
    } else {
      errorToast(error.message || "Something went wrong.");
    }
    return;
  }

  // Handle raw axios errors that might slip through
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      errorToast("Authentication failed. Please sign in again.");
    } else if (error.response?.status === 403) {
      errorToast("Access denied.");
    } else if (error.response?.status && error.response.status >= 500) {
      errorToast("Server error. Please try again later.");
    } else {
      errorToast(error.response?.data?.message || "Something went wrong.");
    }
    return;
  }

  errorToast("An unexpected error occurred.");
}
