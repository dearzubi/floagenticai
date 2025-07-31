import { AxiosRequestConfig } from "axios";
import { apiClientV1 } from "../../utils/http/http.client.ts";
import {
  AllNodesListAPIResponse,
  allNodesListAPIResponseSchema,
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
};
