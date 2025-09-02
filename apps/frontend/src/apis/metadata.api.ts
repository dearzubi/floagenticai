import { publicAPIClientV1 } from "../utils/http/http.client";

export interface VersionResponse {
  version: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Get version information only
 */
export const getVersion = async (): Promise<VersionResponse> => {
  const response = await publicAPIClientV1.makeRequest<
    ApiResponse<VersionResponse>
  >({
    method: "GET",
    url: "/metadata/version",
  });
  return response.data;
};
