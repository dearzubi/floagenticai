import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mcpApi } from "../../../apis/mcp/mcp.api.ts";
import {
  MCPServerListResponse,
  MCPServerListParams,
  MCPInstallationCreate,
  MCPInstallationUpdate,
  MCPInstallationResponse,
} from "../../../apis/mcp/schemas.ts";
import { AppError } from "../../../utils/errors";
import { envs } from "../../../utils/env-schema.ts";

export const mcpQueryKeys = {
  all: ["mcp"] as const,
  servers: (params?: MCPServerListParams) =>
    ["mcp", "servers", params] as const,
  categories: ["mcp", "categories"] as const,
  installations: ["mcp", "installations"] as const,
  installation: (id: string) => ["mcp", "installations", id] as const,
};

/**
 * Get a list of MCP servers from the API with pagination and filtering.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetMCPServers = (
  params?: MCPServerListParams,
  enabled: boolean = true,
) => {
  return useQuery<MCPServerListResponse, AppError>({
    queryKey: mcpQueryKeys.servers(params),
    queryFn: async () => {
      return await mcpApi.getMCPServers(params);
    },
    enabled: enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get user's MCP installations from the API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetUserMCPInstallations = (enabled: boolean = true) => {
  return useQuery<MCPInstallationResponse[], AppError>({
    queryKey: mcpQueryKeys.installations,
    queryFn: async () => {
      return await mcpApi.getUserMCPInstallations();
    },
    enabled: enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a specific MCP installation from the API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetMCPInstallation = (id: string, enabled: boolean = true) => {
  return useQuery<MCPInstallationResponse, AppError>({
    queryKey: mcpQueryKeys.installation(id),
    queryFn: async () => {
      return await mcpApi.getMCPInstallation(id);
    },
    enabled: enabled && Boolean(id),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Install a new MCP server.
 */
export const useInstallMCPServer = () => {
  const queryClient = useQueryClient();

  return useMutation<MCPInstallationResponse, AppError, MCPInstallationCreate>({
    mutationFn: async (data) => {
      return await mcpApi.installMCPServer(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(mcpQueryKeys.installation(data.id), data);
      queryClient.invalidateQueries({
        queryKey: mcpQueryKeys.installations,
      });
    },
  });
};

/**
 * Update an existing MCP installation.
 */
export const useUpdateMCPInstallation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MCPInstallationResponse,
    AppError,
    { id: string; data: MCPInstallationUpdate }
  >({
    mutationFn: async ({ id, data }) => {
      return await mcpApi.updateMCPInstallation(id, data);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(mcpQueryKeys.installation(data.id), data);
      await queryClient.invalidateQueries({
        queryKey: mcpQueryKeys.installations,
      });
    },
  });
};

/**
 * Delete/uninstall an MCP installation.
 */
export const useDeleteMCPInstallation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AppError, string>({
    mutationFn: async (id: string) => {
      return await mcpApi.deleteMCPInstallation(id);
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: mcpQueryKeys.installation(id),
      });
      queryClient.invalidateQueries({
        queryKey: mcpQueryKeys.installations,
      });
    },
  });
};
