import { AxiosRequestConfig } from "axios";
import { z } from "zod/v4";
import { apiClientV1 } from "../../utils/http/http.client.ts";
import {
  MCPServerListResponse,
  mcpServerListResponseSchema,
  MCPCategoriesResponse,
  mcpCategoriesResponseSchema,
  MCPServerListParams,
  MCPInstallationCreate,
  MCPInstallationUpdate,
  MCPInstallationResponse,
  mcpInstallationResponseSchema,
} from "./schemas.ts";

export const mcpApi = {
  getMCPServers: (
    params?: MCPServerListParams,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<MCPServerListResponse>({
      ...config,
      url: `mcp/servers`,
      method: "GET",
      params,
      schema: mcpServerListResponseSchema,
    });
  },

  getMCPCategories: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<MCPCategoriesResponse>({
      ...config,
      url: `mcp/categories`,
      method: "GET",
      schema: mcpCategoriesResponseSchema,
    });
  },

  getUserMCPInstallations: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<MCPInstallationResponse[]>({
      ...config,
      url: `mcp/installations`,
      method: "GET",
      schema: z.array(mcpInstallationResponseSchema),
    });
  },

  installMCPServer: (
    data: MCPInstallationCreate,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<MCPInstallationResponse>({
      ...config,
      url: `mcp/installations`,
      method: "POST",
      data,
      schema: mcpInstallationResponseSchema,
    });
  },

  getMCPInstallation: (id: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<MCPInstallationResponse>({
      ...config,
      url: `mcp/installations/${id}`,
      method: "GET",
      schema: mcpInstallationResponseSchema,
    });
  },

  updateMCPInstallation: (
    id: string,
    data: MCPInstallationUpdate,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<MCPInstallationResponse>({
      ...config,
      url: `mcp/installations/${id}`,
      method: "PATCH",
      data,
      schema: mcpInstallationResponseSchema,
    });
  },

  deleteMCPInstallation: (id: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<{ message: string }>({
      ...config,
      url: `mcp/installations/${id}`,
      method: "DELETE",
      schema: z.object({ message: z.string() }),
    });
  },
};
