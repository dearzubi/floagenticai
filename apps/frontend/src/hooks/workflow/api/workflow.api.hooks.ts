import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { workflowApi } from "../../../apis/workflow/workflow.api.ts";
import {
  DeleteWorkflowAPIResponse,
  WorkflowAPIResponse,
  WorkflowVersionListItem,
  WorkflowVersionAPIResponse,
  ExportWorkflowAPIResponse,
  ImportWorkflowAPIResponse,
} from "../../../apis/workflow/schemas.ts";
import { AppError } from "../../../utils/errors";
import { envs } from "../../../utils/env-schema.ts";

export const workflowQueryKeys = {
  all: ["workflows"] as const,
  workflow: (id: string) => ["workflows", id] as const,
  versions: (workflowId: string) =>
    ["workflows", workflowId, "versions"] as const,
  version: (workflowId: string, version: number) =>
    ["workflows", workflowId, "versions", version] as const,
};

/**
 * Get a workflow from API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetWorkflow = (workflowId: string, enabled: boolean = true) => {
  return useQuery<WorkflowAPIResponse, AppError>({
    queryKey: workflowQueryKeys.workflow(workflowId),
    queryFn: async () => {
      return await workflowApi.getWorkflow(workflowId);
    },
    enabled: enabled && Boolean(workflowId),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a list of workflows from API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetWorkflowList = (enabled: boolean = true) => {
  return useQuery<WorkflowAPIResponse[], AppError>({
    queryKey: workflowQueryKeys.all,
    queryFn: async () => {
      return await workflowApi.getWorkflowList();
    },
    enabled: enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Delete/remove a workflow from the backend (database) and all it's relevant records.
 */
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteWorkflowAPIResponse, AppError, string>({
    mutationFn: async (workflowId: string) => {
      return await workflowApi.deleteWorkflow(workflowId);
    },
    onSuccess: (_, workflowId) => {
      queryClient.removeQueries({
        queryKey: workflowQueryKeys.workflow(workflowId),
      });
      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.all,
      });
    },
  });
};

/**
 * Delete/remove the bulk of workflows from the backend (database) and all their relevant records.
 */
export const useBulkDeleteWorkflows = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteWorkflowAPIResponse[], AppError, string[]>({
    mutationFn: async (workflowIds: string[]) => {
      const promises = workflowIds.map((id) => workflowApi.deleteWorkflow(id));
      const results = await Promise.allSettled(promises);

      return results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<DeleteWorkflowAPIResponse> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
    },
    onSuccess: (_, workflowIds) => {
      workflowIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: workflowQueryKeys.workflow(id),
        });
      });
      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.all,
      });
    },
  });
};

/**
 * Optimistically upsert a workflow in the backend (database).
 * If workflow id is not specified, then it creates the workflow, otherwise updates it.
 * If an incorrect id is provided and the related workflow does not exist, then a new one is created.
 * Workflow is cached using TanStack query while the API call is awaiting completion to improve UX.
 */
export const useOptimisticUpsertWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkflowAPIResponse,
    AppError,
    Pick<
      WorkflowAPIResponse,
      "name" | "serialisedReactFlow" | "isActive" | "config" | "category"
    > & { id?: string }
  >({
    mutationFn: async (data) => {
      const { id: workflowId, ...workflowData } = data;

      try {
        if (!workflowId) {
          return await workflowApi.createWorkflow({
            data: {
              name: workflowData.name,
              serialisedReactFlow: workflowData.serialisedReactFlow,
            },
          });
        }
        return await workflowApi.updateWorkflow(workflowId, {
          data: workflowData,
        });
      } catch (error) {
        if (error instanceof AppError && error.errorCode === "NOT_FOUND") {
          console.info(`Workflow ${workflowId} not found, creating new one`);
          return await workflowApi.createWorkflow({
            data: {
              name: workflowData.name,
              serialisedReactFlow: workflowData.serialisedReactFlow,
            },
          });
        }
        throw error;
      }
    },
    onMutate: async (newData) => {
      const { id: workflowId } = newData;

      if (!workflowId) {
        return { isCreating: true };
      }

      const workflowQueryKey = workflowQueryKeys.workflow(workflowId);
      const listQueryKey = workflowQueryKeys.all;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: workflowQueryKey });
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      // Snapshot previous value
      const previousWorkflow =
        queryClient.getQueryData<WorkflowAPIResponse>(workflowQueryKey);
      const previousWorkflowList =
        queryClient.getQueryData<WorkflowAPIResponse[]>(listQueryKey);

      // Optimistically update if workflow exists
      if (previousWorkflow) {
        queryClient.setQueryData(workflowQueryKey, {
          ...previousWorkflow,
          name: newData.name,
          serialisedReactFlow: newData.serialisedReactFlow,
          isActive: newData.isActive ?? previousWorkflow.isActive,
          config: newData.config ?? previousWorkflow.config,
          category: newData.category ?? previousWorkflow.category,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update the list
      if (previousWorkflowList) {
        const updatedList = previousWorkflowList.map((workflow) => {
          if (workflow.id === workflowId) {
            return {
              ...workflow,
              name: newData.name,
              serialisedReactFlow: newData.serialisedReactFlow,
              isActive: newData.isActive ?? workflow.isActive,
              config: newData.config ?? workflow.config,
              category: newData.category ?? workflow.category,
              updatedAt: new Date().toISOString(),
            };
          }
          return workflow;
        });
        queryClient.setQueryData(listQueryKey, updatedList);
      }

      return {
        previousWorkflow,
        previousWorkflowList,
        isCreating: !previousWorkflow,
      };
    },
    onError: (error, _newData, context) => {
      const ctx = context as
        | {
            previousWorkflow?: WorkflowAPIResponse;
            previousWorkflowList?: WorkflowAPIResponse[];
            isCreating?: boolean;
          }
        | undefined;

      /*
        TODO: We might don't need to rollback, just show the user it failed and let them retry or discard changes and move
          Rolling back might cause one issue, where error occurs and rollbacks while user made new changes and then it will overwrite them
       */

      // Roll back optimistic update if it was an update operation
      if (ctx?.previousWorkflow && !ctx.isCreating) {
        queryClient.setQueryData(
          workflowQueryKeys.workflow(ctx?.previousWorkflow.id),
          ctx.previousWorkflow,
        );
      }

      if (ctx?.previousWorkflowList) {
        queryClient.setQueryData(
          workflowQueryKeys.all,
          ctx.previousWorkflowList,
        );
      }

      console.error("Optimistic upsert failed:", error);
    },
    onSuccess: (data, variables, _context) => {
      // Set the final data
      queryClient.setQueryData(workflowQueryKeys.workflow(data.id), data);

      if (variables.id && variables.id !== data.id) {
        queryClient.removeQueries({
          queryKey: workflowQueryKeys.workflow(variables.id),
        });
      }

      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.all,
      });
    },
  });
};

/**
 * Get workflow versions from API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetWorkflowVersions = (
  workflowId: string,
  enabled: boolean = true,
) => {
  return useQuery<WorkflowVersionListItem[], AppError>({
    queryKey: workflowQueryKeys.versions(workflowId),
    queryFn: async () => {
      return await workflowApi.getWorkflowVersions(workflowId);
    },
    enabled: enabled && Boolean(workflowId),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get workflow versions from API with pagination support.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetInfiniteWorkflowVersions = (
  workflowId: string,
  limit: number = 10,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<WorkflowVersionListItem[], AppError>({
    queryKey: [...workflowQueryKeys.versions(workflowId), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await workflowApi.getWorkflowVersions(
        workflowId,
        pageParam as number,
        limit,
      );
    },
    getNextPageParam: (
      lastPage: WorkflowVersionListItem[],
      allPages: WorkflowVersionListItem[][],
    ) => {
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: enabled && Boolean(workflowId),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a specific workflow version from API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetWorkflowVersion = (
  workflowId: string,
  version: number,
  enabled: boolean = true,
) => {
  return useQuery<WorkflowVersionAPIResponse, AppError>({
    queryKey: workflowQueryKeys.version(workflowId, version),
    queryFn: async () => {
      return await workflowApi.getWorkflowVersion(workflowId, version);
    },
    enabled: enabled && Boolean(workflowId) && Boolean(version),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Restore a workflow version.
 */
export const useRestoreWorkflowVersion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkflowAPIResponse,
    AppError,
    { workflowId: string; version: number; description?: string }
  >({
    mutationFn: async ({ workflowId, version, description }) => {
      return await workflowApi.restoreWorkflowVersion(workflowId, version, {
        data: { description },
      });
    },
    onSuccess: (data, { workflowId }) => {
      // Invalidate and refetch the workflow
      queryClient.setQueryData(workflowQueryKeys.workflow(workflowId), data);
      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.versions(workflowId),
      });
      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.all,
      });
    },
  });
};

/**
 * Export a workflow to JSON format.
 */
export const useExportWorkflow = () => {
  return useMutation<ExportWorkflowAPIResponse, AppError, string>({
    mutationFn: async (workflowId: string) => {
      return await workflowApi.exportWorkflow(workflowId);
    },
  });
};

/**
 * Import a workflow from JSON data.
 */
export const useImportWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ImportWorkflowAPIResponse,
    AppError,
    { workflowData: Record<string, unknown>; name?: string }
  >({
    mutationFn: async ({ workflowData, name }) => {
      return await workflowApi.importWorkflow({
        data: { workflowData, name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.all,
      });
    },
  });
};

/**
 * Delete a workflow version.
 */
export const useDeleteWorkflowVersion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteWorkflowAPIResponse,
    AppError,
    { workflowId: string; version: number }
  >({
    mutationFn: async ({ workflowId, version }) => {
      return await workflowApi.deleteWorkflowVersion(workflowId, version);
    },
    onSuccess: (_, { workflowId, version }) => {
      queryClient.removeQueries({
        queryKey: workflowQueryKeys.version(workflowId, version),
      });
      queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.versions(workflowId),
      });
    },
  });
};
