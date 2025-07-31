import { z } from "zod/v4";
import { APIRequestDataSchemas } from "./types.js";

export const workflowIdSchema = z.uuidv4({
  error: "Invalid workflow ID format",
});

const workflowNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be less than 255 characters");

export const workflowSerialisedReactFlowSchema = z.object({
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
  nodes: z.array(z.record(z.string(), z.unknown())),
  edges: z.array(z.record(z.string(), z.unknown())),
});

const createWorkflow = {
  body: z.object({
    name: workflowNameSchema,
    serialisedReactFlow: workflowSerialisedReactFlowSchema,
  }),
} satisfies APIRequestDataSchemas;

const getWorkflow = {
  params: z.object({
    id: workflowIdSchema,
  }),
} satisfies APIRequestDataSchemas;

const updateWorkflow = {
  params: getWorkflow.params,
  body: z.object({
    name: workflowNameSchema.optional().nullish(),
    serialisedReactFlow: workflowSerialisedReactFlowSchema.optional().nullish(),
    isActive: z.boolean().optional().nullish(),
    config: z.string().optional().nullish(),
    category: z.string().optional().nullish(),
  }),
} satisfies APIRequestDataSchemas;

const getWorkflowVersions = {
  params: z.object({
    workflowId: workflowIdSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
} satisfies APIRequestDataSchemas;

const getWorkflowVersion = {
  params: z.object({
    workflowId: workflowIdSchema,
    version: z.coerce.number().int().positive(),
  }),
} satisfies APIRequestDataSchemas;

const restoreWorkflowVersion = {
  params: getWorkflowVersion.params,
  body: z.object({
    description: z.string().optional(),
  }),
} satisfies APIRequestDataSchemas;

const deleteWorkflowVersion = getWorkflowVersion;

const exportWorkflow = {
  params: z.object({
    id: workflowIdSchema,
  }),
} satisfies APIRequestDataSchemas;

const importWorkflow = {
  body: z.object({
    workflowData: z.record(z.string(), z.unknown()),
    name: workflowNameSchema.optional(),
  }),
} satisfies APIRequestDataSchemas;

export const workflowAPIRequestSchemas = {
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow: getWorkflow,
  getWorkflowVersions,
  getWorkflowVersion,
  restoreWorkflowVersion,
  deleteWorkflowVersion,
  exportWorkflow,
  importWorkflow,
};

export interface CreateWorkflowAPIRequestData {
  body: z.infer<typeof workflowAPIRequestSchemas.createWorkflow.body>;
}
export interface GetWorkflowAPIRequestData {
  params: z.infer<typeof workflowAPIRequestSchemas.getWorkflow.params>;
}
export interface UpdateWorkflowAPIRequestData {
  params: GetWorkflowAPIRequestData["params"];
  body: z.infer<typeof workflowAPIRequestSchemas.updateWorkflow.body>;
}
export type DeleteWorkflowAPIRequestData = GetWorkflowAPIRequestData;

export interface GetWorkflowVersionsAPIRequestData {
  params: z.infer<typeof workflowAPIRequestSchemas.getWorkflowVersions.params>;
  query: z.infer<typeof workflowAPIRequestSchemas.getWorkflowVersions.query>;
}

export interface GetWorkflowVersionAPIRequestData {
  params: z.infer<typeof workflowAPIRequestSchemas.getWorkflowVersion.params>;
}

export interface RestoreWorkflowVersionAPIRequestData {
  params: GetWorkflowVersionAPIRequestData["params"];
  body: z.infer<typeof workflowAPIRequestSchemas.restoreWorkflowVersion.body>;
}

export type DeleteWorkflowVersionAPIRequestData =
  GetWorkflowVersionAPIRequestData;

export interface ExportWorkflowAPIRequestData {
  params: z.infer<typeof workflowAPIRequestSchemas.exportWorkflow.params>;
}

export interface ImportWorkflowAPIRequestData {
  body: z.infer<typeof workflowAPIRequestSchemas.importWorkflow.body>;
}
