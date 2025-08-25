export interface MCPServerListResponse {
  servers: import("./schemas.js").MCPServerDescription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  categories: string[];
}

export interface MCPCategoriesResponse {
  categories: string[];
}

export interface MCPServerListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}
