import { useQuery } from "@tanstack/react-query";
import { getVersion } from "../../../apis/metadata.api";

/**
 * TanStack Query hook for fetching application version
 * Handles caching, refetching, and error states automatically
 */
export const useVersion = () => {
  return useQuery({
    queryKey: ["app-version"],
    queryFn: getVersion,
    staleTime: 15 * 60 * 1000, // 15 minutes - version doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // Use cached data while refetching in background
    refetchOnReconnect: true,
  });
};

/**
 * Hook that returns formatted version data for display
 */
export const useFormattedVersion = () => {
  const { data, isLoading, error, isError } = useVersion();

  return {
    version: data?.version || "Unknown",
    displayVersion: isLoading
      ? "Loading..."
      : isError
        ? "Unknown"
        : data?.version || "Unknown",
    isLoading,
    error,
    isError,
    rawData: data,
  };
};

/**
 * Hook for checking if version data is available
 */
export const useVersionStatus = () => {
  const { data, isLoading, isError, isSuccess } = useVersion();

  return {
    hasVersion: !!data?.version,
    isOnline: isSuccess && !isError,
    status: isLoading
      ? "loading"
      : isError
        ? "error"
        : isSuccess
          ? "online"
          : "unknown",
    version: data?.version,
  };
};
