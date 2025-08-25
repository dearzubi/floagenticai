import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { workflowNodeApi } from "../../../apis/workflow/node.api.ts";
import { envs } from "../../../utils/env-schema.ts";
import { INodeProperty, NodePropertyOption } from "common";
import {
  extractAsyncPropertyDependencies,
  extractRelevantInputs,
  generateAsyncPropertyCacheKey,
  hasRelevantInputsChanged,
} from "../../../components/ui/workflow/builder/node/async-dependencies.utils.ts";

export interface AsyncPropertyLoaderOptions {
  nodeName: string;
  methodName: string;
  inputs: Record<string, unknown>;
  property: INodeProperty;
  enabled?: boolean;
}

export interface AsyncPropertyLoaderResult {
  data?: {
    options?: NodePropertyOption[];
    collection?: INodeProperty[];
    credentialName?: string;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isBackgroundLoading: boolean;
  hasData: boolean;
  refresh: () => void;
}

/**
 * Hook for loading async property data with dependency tracking and background loading
 * - Only triggers when relevant dependencies change
 * - Keeps previous data visible during background loading
 * - Provides background loading state for subtle UI indicators
 * - Optimized caching based on actual dependencies
 */
export const useAsyncPropertyLoader = ({
  nodeName,
  methodName,
  inputs,
  property,
  enabled = true,
}: AsyncPropertyLoaderOptions): AsyncPropertyLoaderResult => {
  const previousInputsRef = useRef<Record<string, unknown>>({});

  const dependencies = useMemo(() => {
    return extractAsyncPropertyDependencies(property);
  }, [property]);

  const relevantInputs = useMemo(() => {
    return extractRelevantInputs(inputs, dependencies);
  }, [inputs, dependencies]);

  const shouldRefetch = useMemo(() => {
    const hasChanged = hasRelevantInputsChanged(
      previousInputsRef.current,
      inputs,
      dependencies,
    );

    if (hasChanged || Object.keys(previousInputsRef.current).length === 0) {
      previousInputsRef.current = { ...inputs };
      return true;
    }

    return false;
  }, [inputs, dependencies]);

  const queryKey = useMemo(() => {
    return generateAsyncPropertyCacheKey(nodeName, methodName, relevantInputs);
  }, [nodeName, methodName, relevantInputs]);

  const queryOptions: UseQueryOptions<
    {
      options?: NodePropertyOption[];
      collection?: INodeProperty[];
      credentialName?: string;
    },
    Error,
    {
      options?: NodePropertyOption[];
      collection?: INodeProperty[];
      credentialName?: string;
    },
    (string | Record<string, unknown>)[]
  > = {
    queryKey,
    queryFn: () => workflowNodeApi.loadMethod({ nodeName, methodName, inputs }),
    enabled: enabled && !!methodName && !!nodeName && shouldRefetch,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: Error) => {
      const errorWithResponse = error as Error & {
        response?: { status?: number };
      };
      if (
        errorWithResponse?.response?.status === 400 ||
        errorWithResponse?.response?.status === 422
      ) {
        return false; // Don't retry validation errors
      }
      return failureCount < 2;
    },
  };

  const query = useQuery(queryOptions);

  // Determine if we're loading in the background (have data but fetching new)
  const isBackgroundLoading = query.isFetching && !!query.data;

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isBackgroundLoading,
    hasData: !!query.data,
    refresh: () => query.refetch(),
  };
};
