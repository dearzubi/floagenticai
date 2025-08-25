import { z } from "zod/v4";
import { credentialAPIResponseSchema } from "../credentials/schemas.ts";
import { mcpServerDescriptionSchema } from "common";

export const mcpServerListParamsSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  category: z.string().optional(),
});

export const mcpServerListResponseSchema = z.object({
  servers: z.array(mcpServerDescriptionSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  categories: z.array(z.string()),
});

export const mcpCategoriesResponseSchema = z.object({
  categories: z.array(z.string()),
});

export const mcpInstallationCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mcpServerName: z.string().min(1, "MCP server name is required"),
  selectedTools: z.array(z.string()),
  approvalRequiredTools: z.array(z.string()),
  credential: credentialAPIResponseSchema.omit({ data: true }).nullish(),
  configuration: z.record(z.string(), z.any()).optional(),
  status: z.enum(["enabled", "disabled"]).default("enabled"),
  description: z.union([z.string(), z.null()]).optional(),
});

export const mcpInstallationUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  selectedTools: z.array(z.string()).optional(),
  approvalRequiredTools: z.array(z.string()).optional(),
  credential: credentialAPIResponseSchema.omit({ data: true }).nullish(),
  configuration: z.record(z.string(), z.any()).optional(),
  status: z.enum(["enabled", "disabled"]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
});

export const mcpInstallationResponseSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  mcpServerName: z.string(),
  selectedTools: z.array(z.string()),
  approvalRequiredTools: z.array(z.string()),
  credential: credentialAPIResponseSchema.omit({ data: true }).nullish(),
  configuration: z.record(z.string(), z.any()).nullish(),
  status: z.enum(["enabled", "disabled"]),
  description: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
  serverInfo: mcpServerDescriptionSchema.optional(),
});

export type MCPServerListParams = z.infer<typeof mcpServerListParamsSchema>;
export type MCPServerListResponse = z.infer<typeof mcpServerListResponseSchema>;
export type MCPCategoriesResponse = z.infer<typeof mcpCategoriesResponseSchema>;
export type MCPInstallationCreate = z.infer<typeof mcpInstallationCreateSchema>;
export type MCPInstallationUpdate = z.infer<typeof mcpInstallationUpdateSchema>;
export type MCPInstallationResponse = z.infer<
  typeof mcpInstallationResponseSchema
>;
