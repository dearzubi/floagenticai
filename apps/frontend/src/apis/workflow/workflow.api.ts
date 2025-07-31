import { AxiosRequestConfig } from "axios";
import { apiClientV1 } from "../../utils/http/http.client.ts";
import {
  workflowAPIResponseSchema,
  deleteWorkflowAPIResponseSchema,
  workflowVersionListItemSchema,
  workflowVersionAPIResponseSchema,
  WorkflowAPIResponse,
  DeleteWorkflowAPIResponse,
  WorkflowVersionListItem,
  WorkflowVersionAPIResponse,
  exportWorkflowAPIResponseSchema,
  importWorkflowAPIResponseSchema,
  ExportWorkflowAPIResponse,
  ImportWorkflowAPIResponse,
} from "./schemas.ts";
import { z } from "zod/v4";

export const workflowApi = {
  createWorkflow: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<WorkflowAPIResponse>({
      ...config,
      url: `workflow`,
      method: "POST",
      schema: workflowAPIResponseSchema,
    });
  },
  updateWorkflow: (workflowId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<WorkflowAPIResponse>({
      ...config,
      url: `workflow/${workflowId}`,
      method: "PATCH",
      schema: workflowAPIResponseSchema,
    });
  },
  getWorkflowList: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<WorkflowAPIResponse[]>({
      ...config,
      url: `workflow/list`,
      method: "GET",
      schema: z.array(workflowAPIResponseSchema),
    });
  },
  getWorkflow: (workflowId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<WorkflowAPIResponse>({
      ...config,
      url: `workflow/${workflowId}`,
      method: "GET",
      schema: workflowAPIResponseSchema,
    });
  },
  deleteWorkflow: (workflowId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<DeleteWorkflowAPIResponse>({
      ...config,
      url: `workflow/${workflowId}`,
      method: "DELETE",
      schema: deleteWorkflowAPIResponseSchema,
    });
  },
  getWorkflowVersions: (
    workflowId: string,
    page?: number,
    limit?: number,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<WorkflowVersionListItem[]>({
      ...config,
      url: `workflow/${workflowId}/versions`,
      method: "GET",
      params: { page, limit },
      schema: z.array(workflowVersionListItemSchema),
    });
  },
  getWorkflowVersion: (
    workflowId: string,
    version: number,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<WorkflowVersionAPIResponse>({
      ...config,
      url: `workflow/${workflowId}/versions/${version}`,
      method: "GET",
      schema: workflowVersionAPIResponseSchema,
    });
  },
  restoreWorkflowVersion: (
    workflowId: string,
    version: number,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<WorkflowAPIResponse>({
      ...config,
      url: `workflow/${workflowId}/versions/${version}/restore`,
      method: "POST",
      schema: workflowAPIResponseSchema,
    });
  },
  deleteWorkflowVersion: (
    workflowId: string,
    version: number,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<DeleteWorkflowAPIResponse>({
      ...config,
      url: `workflow/${workflowId}/versions/${version}`,
      method: "DELETE",
      schema: deleteWorkflowAPIResponseSchema,
    });
  },
  exportWorkflow: (workflowId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<ExportWorkflowAPIResponse>({
      ...config,
      url: `workflow/${workflowId}/export`,
      method: "GET",
      schema: exportWorkflowAPIResponseSchema,
    });
  },
  importWorkflow: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<ImportWorkflowAPIResponse>({
      ...config,
      url: `workflow/import`,
      method: "POST",
      schema: importWorkflowAPIResponseSchema,
    });
  },
};
