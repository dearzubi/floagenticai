import { AxiosRequestConfig } from "axios";
import { apiClientV1 } from "../../utils/http/http.client.ts";
import {
  AllNodesListAPIResponse,
  allNodesListAPIResponseSchema,
  LoadMethodAPIResponse,
  loadMethodAPIResponseSchema,
} from "./schemas.ts";

export const workflowNodeApi = {
  listAllNodes: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<AllNodesListAPIResponse>({
      ...config,
      url: `workflow/node/list`,
      method: "GET",
      schema: allNodesListAPIResponseSchema,
    });
  },

  loadMethod: (
    data: {
      version?: string | number;
      nodeName: string;
      methodName: string;
      inputs: Record<string, unknown>;
    },
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<LoadMethodAPIResponse>({
      ...config,
      url: `workflow/node/load-method`,
      method: "POST",
      data,
      schema: loadMethodAPIResponseSchema,
    });
  },
};
