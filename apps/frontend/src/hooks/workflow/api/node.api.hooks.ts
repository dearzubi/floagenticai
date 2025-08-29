import { useQuery } from "@tanstack/react-query";
import { workflowNodeApi } from "../../../apis/workflow/node.api.ts";
import { envs } from "../../../utils/env-schema.ts";

/**
 * Get a list of all workflow nodes from the API. Response is cached for 1 minute if caching is enabled.
 * @param enabled - Enable or disable TanStack query
 */
export const useListAllNodes = (enabled = true) => {
  return useQuery({
    queryKey: ["workflow", "list-all-nodes"],
    queryFn: () => workflowNodeApi.listAllNodes(),
    enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 60 * 1000,
  });
};

/**
 * Calls a load method on a node on the server and fetches data from the API.
 * @param nodeName
 * @param methodName
 * @param inputs
 * @param enabled
 */
export const useLoadMethod = ({
  nodeName,
  methodName,
  inputs,
  enabled = true,
}: {
  nodeName: string;
  methodName: string;
  inputs: Record<string, unknown>;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["workflow", "node", "load-method", nodeName, methodName, inputs],
    queryFn: () => workflowNodeApi.loadMethod({ nodeName, methodName, inputs }),
    enabled: enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 60 * 1000,
  });
};
