import { z } from "zod/v4";

const mcpServerListQuerySchema = z.object({
  page: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be a positive number" }),
  limit: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
  search: z.string().nullish(),
  category: z.string().nullish(),
});

export type MCPServerListQuery = z.infer<typeof mcpServerListQuerySchema>;

const mcpInstallationSchema = z.object({
  name: z.string().min(1, {
    error: "Name is required",
  }),
  mcpServerName: z.string().min(1, {
    error: "MCP server name is required",
  }),
  selectedTools: z.array(z.string()),
  approvalRequiredTools: z.array(z.string()),
  credentialId: z.string().nullish(),
  configuration: z
    .record(z.string(), z.any())
    .nullish()
    .transform((v) => v ?? undefined),
  status: z.enum(["enabled", "disabled"]).default("enabled"),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
});

const mcpInstallationUpdateSchema = z.object({
  name: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  selectedTools: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  approvalRequiredTools: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  credentialId: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  configuration: z
    .record(z.string(), z.any())
    .nullish()
    .transform((v) => v ?? undefined),
  status: z
    .enum(["enabled", "disabled"])
    .nullish()
    .transform((v) => v ?? undefined),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
});

const mcpInstallationIdSchema = z.object({
  id: z.uuidv4({
    error: "Invalid MCP server installation ID format",
  }),
});

export const mcpAPIRequestSchemas = {
  getMCPServers: {
    query: mcpServerListQuerySchema,
  },
  installMCPServer: {
    body: mcpInstallationSchema,
  },
  updateMCPInstallation: {
    params: mcpInstallationIdSchema,
    body: mcpInstallationUpdateSchema,
  },
  deleteMCPInstallation: {
    params: mcpInstallationIdSchema,
  },
  getMCPInstallation: {
    params: mcpInstallationIdSchema,
  },
};

export type MCPInstallationCreate = z.infer<typeof mcpInstallationSchema>;
export type MCPInstallationUpdate = z.infer<typeof mcpInstallationUpdateSchema>;
export type MCPInstallationId = z.infer<typeof mcpInstallationIdSchema>;
