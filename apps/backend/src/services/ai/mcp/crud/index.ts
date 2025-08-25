import { MCPServerCategory, MCPServerDescription } from "common";
import { mcpServers } from "../servers/index.js";
import { GetMCPServersResponse, UserMCPInstallation } from "./types.js";
import { DB } from "../../../../database/init.js";
import {
  MCPInstallation,
  MCPInstallationStatus,
} from "../../../../database/entities/mcp-installation.entity.js";
import { User } from "../../../../database/entities/user.entity.js";
import {
  MCPInstallationCreate,
  MCPInstallationUpdate,
} from "../../../../api/v1/schemas/mcp.schemas.js";
import { NotFoundError } from "../../../../utils/errors/notfound.error.js";
import { Credential } from "../../../../database/entities/credential.entity.js";
import { ValidationError } from "../../../../utils/errors/validation.error.js";
import { Loaded, PopulatePath } from "@mikro-orm/core";

/**
 * Get MCP servers list with pagination, search, and category filtering
 * @param page
 * @param limit
 * @param searchTerm
 * @param category
 */
export const getMCPServersList = ({
  page,
  limit,
  searchTerm,
  category,
}: {
  page: number;
  limit: number;
  searchTerm?: string;
  category?: string;
}): GetMCPServersResponse => {
  const allServers: MCPServerDescription[] = Array.from(
    mcpServers.values(),
  ).map((server) => server.description);

  let filteredServers = allServers;

  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredServers = filteredServers.filter(
      (server) =>
        server.name.toLowerCase().includes(searchLower) ||
        server.label.toLowerCase().includes(searchLower) ||
        server.description.toLowerCase().includes(searchLower) ||
        server.tools.some((tool) => tool.toLowerCase().includes(searchLower)),
    );
  }

  if (category) {
    filteredServers = filteredServers.filter(
      (server) => server.category === category,
    );
  }

  const total = filteredServers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedServers = filteredServers.slice(startIndex, endIndex);

  const categories = Array.from(
    new Set(allServers.map((server) => server.category)),
  );

  return {
    servers: paginatedServers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    categories,
  } satisfies GetMCPServersResponse;
};

/**
 * Get list of all MCP server categories
 */
export const getMCPCategories = (): MCPServerCategory[] => {
  const allServers: MCPServerDescription[] = Array.from(
    mcpServers.values(),
  ).map((server) => server.description);

  return Array.from(new Set(allServers.map((server) => server.category)));
};

/**
 * Get MCP installations for a user with MCP server info
 * @param db
 * @param userId
 */
export const getUserMCPInstallations = async ({
  db,
  userId,
}: {
  db: DB;
  userId: string;
}): Promise<UserMCPInstallation[]> => {
  const installations = await db.find(
    MCPInstallation,
    { user: userId },
    {
      populate: ["credential"],
      exclude: ["credential.encryptedData", "credential.user"],
    },
  );

  return installations.map((installation) => {
    const serverInfo = mcpServers.get(installation.mcpServerName)?.description;
    return {
      ...installation,
      serverInfo,
    };
  });
};

/**
 * Create a new MCP installation for a user
 * @param user
 * @param data
 * @param db
 */
export const createMCPInstallation = async ({
  user,
  data,
  db,
}: {
  user: User;
  data: MCPInstallationCreate;
  db: DB;
}): Promise<MCPInstallation> => {
  const serverExists = mcpServers.has(data.mcpServerName);
  if (!serverExists) {
    throw new NotFoundError(`MCP server '${data.mcpServerName}' not found`);
  }

  let credential: Credential | undefined = undefined;
  if (data.credentialId) {
    credential =
      (await db.findOne(Credential, {
        id: data.credentialId,
        user,
      })) || undefined;
  }
  if (data.credentialId && !credential) {
    throw new NotFoundError("Credential not found");
  }

  const existingInstallation = await db.findOne(MCPInstallation, {
    user,
    name: data.name,
  });
  if (existingInstallation) {
    throw new ValidationError(
      `MCP installation with name '${data.name}' already exists`,
    );
  }

  const installation = db.create(MCPInstallation, {
    user: user,
    name: data.name,
    mcpServerName: data.mcpServerName,
    selectedTools: data.selectedTools,
    approvalRequiredTools: data.approvalRequiredTools,
    credential: credential,
    configuration: data.configuration,
    status: data.status as MCPInstallationStatus,
    description: data.description,
  });

  await db.flush();
  return installation;
};

/**
 * Get a specific MCP installation by ID for a user with MCP server info
 * @param db
 * @param userId
 * @param installationId
 */
export const getMCPInstallation = async ({
  db,
  userId,
  installationId,
}: {
  db: DB;
  userId: string;
  installationId: string;
}): Promise<UserMCPInstallation> => {
  const installation = await db.findOne(
    MCPInstallation,
    { id: installationId, user: userId },
    {
      populate: ["credential"],
      exclude: ["credential.encryptedData", "credential.user"],
    },
  );

  if (!installation) {
    throw new NotFoundError("MCP installation not found");
  }

  const serverInfo = mcpServers.get(installation.mcpServerName)?.description;

  return {
    ...installation,
    serverInfo,
  };
};

/**
 * Update an existing MCP installation
 * @param installationId
 * @param data
 * @param db
 * @param user
 */
export const updateMCPInstallation = async ({
  installationId,
  data,
  db,
  user,
}: {
  installationId: string;
  data: MCPInstallationUpdate;
  db: DB;
  user: User;
}): Promise<Loaded<MCPInstallation, "credential", PopulatePath.ALL, "credential.encryptedData" | "credential.user">> => {
  const installation = await db.findOne(
    MCPInstallation,
    { id: installationId, user: user.id },
    {
      populate: ["credential"],
      exclude: ["credential.encryptedData", "credential.user"],
    },
  );

  if (!installation) {
    throw new NotFoundError("MCP installation not found");
  }

  if (typeof data.credentialId === "string") {
    if (data.credentialId.length > 0) {
      const credential = await db.findOne(Credential, {
        id: data.credentialId,
        user: user.id,
      });
      if (!credential) {
        throw new NotFoundError("Credential not found");
      }
      installation.credential = credential;
    } else {
      installation.credential = undefined;
    }
  }

  if (data.name !== undefined) {
    installation.name = data.name;
  }
  if (data.selectedTools !== undefined) {
    installation.selectedTools = data.selectedTools;
  }
  if (data.approvalRequiredTools !== undefined) {
    installation.approvalRequiredTools = data.approvalRequiredTools;
  }
  if (data.configuration !== undefined) {
    installation.configuration = data.configuration;
  }
  if (data.status !== undefined) {
    installation.status = data.status as MCPInstallationStatus;
  }
  if (data.description !== undefined) {
    installation.description = data.description;
  }

  await db.persist(installation).flush();
  return installation;
};

/**
 * Delete an MCP installation
 * @param userId
 * @param db
 * @param installationId
 */
export const deleteMCPInstallation = async ({
  userId,
  db,
  installationId,
}: {
  userId: string;
  db: DB;
  installationId: string;
}): Promise<void> => {
  const installation = await db.findOne(MCPInstallation, {
    id: installationId,
    user: userId,
  });

  if (!installation) {
    return;
  }

  await db.remove(installation).flush();
};
