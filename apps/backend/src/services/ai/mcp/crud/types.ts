import { MCPServerCategory, MCPServerDescription } from "common";
import { MCPInstallation } from "../../../../database/entities/mcp-installation.entity.js";
import { Loaded, PopulatePath } from "@mikro-orm/core";

export type GetMCPServersResponse = {
  servers: MCPServerDescription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  categories: MCPServerCategory[];
};

export type UserMCPInstallation = Loaded<MCPInstallation, "credential", PopulatePath.ALL, "credential.encryptedData" | "credential.user"> & {
  serverInfo?: MCPServerDescription;
};
