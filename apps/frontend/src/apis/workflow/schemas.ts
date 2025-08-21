import { z } from "zod/v4";
import {
  nodeSerialisedSchema,
  nodePropertyOptionSchema,
  nodePropertySchema,
} from "common";

export const allNodesListAPIResponseSchema = z.array(nodeSerialisedSchema);

export type AllNodesListAPIResponse = z.infer<
  typeof allNodesListAPIResponseSchema
>;

export const workflowAPIResponseSchema = z.object({
  id: z.uuidv4(),
  name: z.string().nonempty(),
  currentVersion: z.number().positive(),
  serialisedReactFlow: z.object({
    viewport: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    }),
    nodes: z.array(z.record(z.string(), z.unknown())),
    edges: z.array(z.record(z.string(), z.unknown())),
  }),
  isActive: z.boolean().optional().nullish(),
  apiKey: z.string().optional().nullish(),
  config: z.string().optional().nullish(),
  category: z.string().optional().nullish(),
  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty(),
});

export const workflowVersionListItemSchema = z.object({
  id: z.uuidv4(),
  version: z.number().positive(),
  name: z.string().nonempty(),
  config: z.string().optional().nullish(),
  category: z.string().optional().nullish(),
  description: z.string().optional().nullish(),
  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty(),
});

export const workflowVersionAPIResponseSchema = z.object({
  id: z.uuidv4(),
  version: z.number().positive(),
  name: z.string().nonempty(),
  serialisedReactFlow: z.object({
    viewport: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    }),
    nodes: z.array(z.record(z.string(), z.unknown())),
    edges: z.array(z.record(z.string(), z.unknown())),
  }),
  config: z.string().optional().nullish(),
  category: z.string().optional().nullish(),
  description: z.string().optional().nullish(),
  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty(),
});

export const deleteWorkflowAPIResponseSchema = z.object({
  message: z.string().nonempty(),
});

export type WorkflowAPIResponse = z.infer<typeof workflowAPIResponseSchema>;
export type DeleteWorkflowAPIResponse = z.infer<
  typeof deleteWorkflowAPIResponseSchema
>;
export type WorkflowVersionListItem = z.infer<
  typeof workflowVersionListItemSchema
>;
export type WorkflowVersionAPIResponse = z.infer<
  typeof workflowVersionAPIResponseSchema
>;

export const exportWorkflowAPIResponseSchema = z.object({
  name: z.string(),
  serialisedReactFlow: z.object({
    viewport: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    }),
    nodes: z.array(z.record(z.string(), z.unknown())),
    edges: z.array(z.record(z.string(), z.unknown())),
  }),
  config: z.string().optional(),
  category: z.string().optional(),
  exportedAt: z.string(),
  currentVersion: z.number(),
});

export const importWorkflowAPIResponseSchema = workflowAPIResponseSchema.extend(
  {
    message: z.string(),
  },
);

export type ExportWorkflowAPIResponse = z.infer<
  typeof exportWorkflowAPIResponseSchema
>;
export type ImportWorkflowAPIResponse = z.infer<
  typeof importWorkflowAPIResponseSchema
>;

export const loadMethodAPIResponseSchema = z.object({
  options: z.array(nodePropertyOptionSchema).optional(),
  collection: z.array(nodePropertySchema).optional(),
});

export type LoadMethodAPIResponse = z.infer<typeof loadMethodAPIResponseSchema>;
