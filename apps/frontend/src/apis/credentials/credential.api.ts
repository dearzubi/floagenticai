import { AxiosRequestConfig } from "axios";
import { apiClientV1 } from "../../utils/http/http.client.ts";
import {
  AllCredentialDefinitionsList,
  allCredentialDefinitionsListAPIResponseSchema,
  CredentialAPIResponse,
  credentialAPIResponseSchema,
  DeleteCredentialAPIResponse,
  deleteCredentialAPIResponseSchema,
} from "./schemas.ts";
import { z } from "zod/v4";

export const credentialApi = {
  listAllCredentialDefinitions: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<AllCredentialDefinitionsList>({
      ...config,
      url: `credential/list/definitions`,
      method: "GET",
      schema: allCredentialDefinitionsListAPIResponseSchema,
    });
  },
  createCredential: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<CredentialAPIResponse>({
      ...config,
      url: `credential`,
      method: "POST",
      schema: credentialAPIResponseSchema,
    });
  },
  updateCredential: (credentialId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<CredentialAPIResponse>({
      ...config,
      url: `credential/${credentialId}`,
      method: "PATCH",
      schema: credentialAPIResponseSchema,
    });
  },
  getCredential: (credentialId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<CredentialAPIResponse>({
      ...config,
      url: `credential/${credentialId}`,
      method: "GET",
      schema: credentialAPIResponseSchema,
    });
  },
  getCredentialList: (config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<CredentialAPIResponse[]>({
      ...config,
      url: `credential/list`,
      method: "GET",
      schema: z.array(credentialAPIResponseSchema),
    });
  },
  getCredentialsByCredentialNames: (
    credentialNames: string,
    config?: AxiosRequestConfig,
  ) => {
    return apiClientV1.makeRequest<CredentialAPIResponse[]>({
      ...config,
      url: `credential/list/by-names/${credentialNames}`,
      method: "GET",
      schema: z.array(credentialAPIResponseSchema),
    });
  },
  deleteCredential: (credentialId: string, config?: AxiosRequestConfig) => {
    return apiClientV1.makeRequest<DeleteCredentialAPIResponse>({
      ...config,
      url: `credential/${credentialId}`,
      method: "DELETE",
      schema: deleteCredentialAPIResponseSchema,
    });
  },
};
