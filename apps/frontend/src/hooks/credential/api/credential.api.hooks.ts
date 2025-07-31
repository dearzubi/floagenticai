import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { credentialApi } from "../../../apis/credentials/credential.api.ts";
import {
  CredentialAPIResponse,
  DeleteCredentialAPIResponse,
  AllCredentialDefinitionsList,
} from "../../../apis/credentials/schemas.ts";
import { AppError } from "../../../utils/errors";
import { envs } from "../../../utils/env-schema.ts";

export const credentialQueryKeys = {
  all: ["credentials"] as const,
  credential: (id: string) => ["credentials", id] as const,
  byCredentialNames: (credentialNames: string) =>
    ["credentials", "by-names", credentialNames] as const,
  definitions: ["credential", "list-all-credential-definitions"] as const,
};

/**
 * Get a list of all credential definitions from the API. Response is cached for 10 minutes if caching is enabled.
 * @param enabled - Enable or disable TanStack query
 */
export const useCredentialDefinitionList = (enabled = true) => {
  return useQuery<AllCredentialDefinitionsList, AppError>({
    queryKey: credentialQueryKeys.definitions,
    queryFn: () => credentialApi.listAllCredentialDefinitions(),
    enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 10 * 60 * 1000,
  });
};

/**
 * Get a credential from API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetCredential = (
  credentialId: string,
  enabled: boolean = true,
) => {
  return useQuery<CredentialAPIResponse, AppError>({
    queryKey: credentialQueryKeys.credential(credentialId),
    queryFn: async () => {
      return await credentialApi.getCredential(credentialId);
    },
    enabled: enabled && Boolean(credentialId),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a list of credentials from API.
 * Data is cached for 5 minutes if caching is enabled.
 */
export const useGetCredentialList = (enabled: boolean = true) => {
  return useQuery<CredentialAPIResponse[], AppError>({
    queryKey: credentialQueryKeys.all,
    queryFn: async () => {
      return await credentialApi.getCredentialList();
    },
    enabled: enabled,
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get credentials by their credentialName field from API.
 * Data is cached for 5 minutes if caching is enabled.
 * @param credentialNames - Comma-separated list of credentialName values to search for
 * @param enabled - Enable or disable TanStack query
 */
export const useGetCredentialsByCredentialNames = (
  credentialNames: string,
  enabled: boolean = true,
) => {
  return useQuery<CredentialAPIResponse[], AppError>({
    queryKey: credentialQueryKeys.byCredentialNames(credentialNames),
    queryFn: async () => {
      return await credentialApi.getCredentialsByCredentialNames(
        credentialNames,
      );
    },
    enabled: enabled && Boolean(credentialNames.trim()),
    staleTime: envs.VITE_DISABLE_API_CACHING ? 0 : 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create a new credential in the backend (database).
 */
export const useCreateCredential = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CredentialAPIResponse,
    AppError,
    {
      name: string;
      credentialName: string;
      data: Record<string, string>;
    }
  >({
    mutationFn: async (data) => {
      return await credentialApi.createCredential({ data });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(credentialQueryKeys.credential(data.id), data);
      queryClient.invalidateQueries({
        queryKey: credentialQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: credentialQueryKeys.byCredentialNames(
          variables.credentialName,
        ),
      });
    },
  });
};

/**
 * Update an existing credential in the backend (database).
 */
export const useUpdateCredential = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CredentialAPIResponse,
    AppError,
    {
      id: string;
      data: {
        name: string;
        data: Record<string, string>;
      };
    }
  >({
    mutationFn: async ({ id, data }) => {
      return await credentialApi.updateCredential(id, { data });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(credentialQueryKeys.credential(data.id), data);
      queryClient.invalidateQueries({
        queryKey: credentialQueryKeys.all,
      });
      if (data.credentialName) {
        queryClient.invalidateQueries({
          queryKey: credentialQueryKeys.byCredentialNames(data.credentialName),
        });
      }
    },
  });
};

/**
 * Delete/remove a credential from the backend (database) and all its relevant records.
 */
export const useDeleteCredential = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCredentialAPIResponse, AppError, string>({
    mutationFn: async (credentialId: string) => {
      return await credentialApi.deleteCredential(credentialId);
    },
    onSuccess: (_, credentialId) => {
      queryClient.removeQueries({
        queryKey: credentialQueryKeys.credential(credentialId),
      });
      queryClient.invalidateQueries({
        queryKey: credentialQueryKeys.all,
      });
    },
  });
};

/**
 * Delete/remove the bulk of credentials from the backend (database) and all their relevant records.
 */
export const useBulkDeleteCredentials = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCredentialAPIResponse[], AppError, string[]>({
    mutationFn: async (credentialIds: string[]) => {
      const promises = credentialIds.map((id) =>
        credentialApi.deleteCredential(id),
      );
      const results = await Promise.allSettled(promises);

      return results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<DeleteCredentialAPIResponse> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
    },
    onSuccess: (_, credentialIds) => {
      credentialIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: credentialQueryKeys.credential(id),
        });
      });
      queryClient.invalidateQueries({
        queryKey: credentialQueryKeys.all,
      });
    },
  });
};
