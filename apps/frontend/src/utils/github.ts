/**
 * Utility functions for fetching GitHub repository statistics with TanStack Query integration
 */

export interface GitHubStats {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  subscribers: number;
  language: string;
  size: number;
  lastUpdated: string;
  commitCount: number;
}

export interface GitHubContributor {
  login: string;
  contributions: number;
  avatar_url: string;
}

export interface GitHubContributors {
  totalContributors: number;
  contributors: GitHubContributor[];
}

export interface GitHubData {
  stats: GitHubStats;
  contributors: GitHubContributors;
}

const GITHUB_API_BASE = "https://api.github.com";
const REPO_OWNER = "dearzubi";
const REPO_NAME = "floagenticai";

/**
 * Common fetch function for GitHub API with proper headers
 */
const fetchFromGitHubAPI = async (endpoint: string): Promise<Response> => {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "FloAgenticAI-Website",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} - ${response.statusText}`,
    );
  }

  return response;
};

/**
 * Fetch complete GitHub data in a single optimized call
 */
export const fetchGitHubData = async (): Promise<GitHubData> => {
  try {
    const [repoResponse, contributorsResponse] = await Promise.all([
      fetchFromGitHubAPI(`/repos/${REPO_OWNER}/${REPO_NAME}`),
      fetchFromGitHubAPI(`/repos/${REPO_OWNER}/${REPO_NAME}/contributors`),
    ]);

    const [repoData, contributorsData] = await Promise.all([
      repoResponse.json(),
      contributorsResponse.json(),
    ]);

    const defaultBranch = repoData.default_branch || "main";
    const commitsResponse = await fetchFromGitHubAPI(
      `/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${defaultBranch}&per_page=1`,
    );

    let commitCount = 1; // Default fallback
    const linkHeader = commitsResponse.headers.get("Link");
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (match) {
        commitCount = parseInt(match[1], 10);
      }
    }

    const stats: GitHubStats = {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      watchers: repoData.watchers_count || 0,
      subscribers: repoData.subscribers_count || 0,
      language: repoData.language || "TypeScript",
      size: repoData.size || 0,
      lastUpdated: repoData.updated_at || new Date().toISOString(),
      commitCount,
    };

    const contributors: GitHubContributors = {
      totalContributors: contributorsData.length || 0,
      contributors:
        contributorsData
          .slice(0, 10)
          .map(
            (contributor: {
              login: string;
              contributions: number;
              avatar_url: string;
            }) => ({
              login: contributor.login,
              contributions: contributor.contributions,
              avatar_url: contributor.avatar_url,
            }),
          ) || [],
    };

    return { stats, contributors };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);

    return {
      stats: {
        stars: 0,
        forks: 0,
        openIssues: 0,
        watchers: 0,
        subscribers: 0,
        language: "TypeScript",
        size: 0,
        lastUpdated: new Date().toISOString(),
        commitCount: 0,
      },
      contributors: {
        totalContributors: 0,
        contributors: [],
      },
    };
  }
};

/**
 * Format number for display (e.g., 1234 -> 1.2K)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Get relative time string (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
};
