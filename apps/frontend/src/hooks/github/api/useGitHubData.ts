import { useQuery } from "@tanstack/react-query";
import {
  fetchGitHubData,
  formatNumber,
  type GitHubStats,
} from "../../../utils/github";

/**
 * TanStack Query hook for fetching GitHub repository data
 * Handles caching, refetching, and error states automatically
 */
export const useGitHubData = () => {
  return useQuery({
    queryKey: ["github-data"],
    queryFn: fetchGitHubData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook that returns formatted GitHub stats for display
 */
export const useGitHubStats = () => {
  const { data, isLoading, error, isError } = useGitHubData();

  const formatStats = (stats: GitHubStats) => [
    {
      key: "stars",
      value: formatNumber(stats.stars),
      label: "GitHub Stars",
      icon: "lucide:star",
      color: "warning",
    },
    {
      key: "forks",
      value: formatNumber(stats.forks),
      label: "Forks",
      icon: "lucide:git-fork",
      color: "success",
    },
    {
      key: "contributors",
      value: formatNumber(data?.contributors.totalContributors || 0),
      label: "Contributors",
      icon: "lucide:users",
      color: "primary",
    },
    {
      key: "commits",
      value: formatNumber(stats.commitCount),
      label: "Commits",
      icon: "lucide:git-commit",
      color: "secondary",
    },
  ];

  return {
    stats: data?.stats ? formatStats(data.stats) : [],
    isLoading,
    error,
    isError,
    rawData: data,
  };
};

/**
 * Hook specifically for contributors data
 */
export const useGitHubContributors = () => {
  const { data, isLoading, error, isError } = useGitHubData();

  return {
    contributors: data?.contributors,
    isLoading,
    error,
    isError,
  };
};

/**
 * Hook for repository metadata
 */
export const useGitHubRepoInfo = () => {
  const { data, isLoading, error, isError } = useGitHubData();

  return {
    language: data?.stats.language,
    lastUpdated: data?.stats.lastUpdated,
    size: data?.stats.size,
    isLoading,
    error,
    isError,
  };
};
