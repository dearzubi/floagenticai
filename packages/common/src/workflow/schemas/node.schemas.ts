import { z } from "zod/v4";
import { nodeCategories, nodeNames, nodePropertyTypes } from "../constants.js";
import { commonPrimitiveTypesSchema } from "../../shared/index.js";
import { INodeProperty } from "../types.js";
import { credentialNames } from "../../credentials/index.js"; // Keep this import as it is

export const nodeBaseDescriptionSchema = z.object({
  label: z.string().nonempty(),
  name: z.enum(nodeNames),
  icon: z.string().optional(),
  category: z.enum(nodeCategories),
  description: z.string().nonempty(),
  documentationUrl: z.string().optional(),
  defaultVersion: z.number().optional(),
  adminAccessOnly: z.boolean().optional(),
  disabled: z.boolean().optional(),
  trigger: z.boolean().optional(),
});

export const nodePropertyDisplayConditionsSchema = z.object({
  _cnd: z.union([
    z.object({ eq: commonPrimitiveTypesSchema }),
    z.object({ not: commonPrimitiveTypesSchema }),
    z.object({ gte: z.union([z.number(), z.string()]) }),
    z.object({ lte: z.union([z.number(), z.string()]) }),
    z.object({ gt: z.union([z.number(), z.string()]) }),
    z.object({ lt: z.union([z.number(), z.string()]) }),
    z.object({
      between: z.object({
        from: z.union([z.number(), z.string()]),
        to: z.union([z.number(), z.string()]),
      }),
    }),
    z.object({ startsWith: z.string() }),
    z.object({ endsWith: z.string() }),
    z.object({ includes: z.string() }),
    z.object({ regex: z.string() }),
    z.object({ exists: z.literal(true) }),
  ]),
});

export const nodePropertyDisplayOptionsSchema = z.object({
  hide: z
    .record(
      z.string(),
      z.array(
        z.union([
          commonPrimitiveTypesSchema,
          nodePropertyDisplayConditionsSchema,
        ]),
      ),
    )
    .optional(),
  show: z
    .object({
      "@version": z
        .array(z.union([z.number(), nodePropertyDisplayConditionsSchema]))
        .optional(),
    })
    .catchall(
      z
        .array(
          z.union([
            commonPrimitiveTypesSchema,
            nodePropertyDisplayConditionsSchema,
          ]),
        )
        .optional(),
    )
    .optional(),
});

export const nodeCredentialDisplayOptionsSchema = z.object({
  hide: z
    .record(z.string(), z.array(commonPrimitiveTypesSchema).optional())
    .optional(),
  show: z
    .object({
      "@version": z.array(z.number()).optional(),
    })
    .catchall(z.array(commonPrimitiveTypesSchema).optional())
    .optional(),
});

export const nodePropertyOptionSchema = z.object({
  name: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const nodeGridItemSchema = z.object({
  label: z.string(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  icon: z.string().optional(),
  collection: z.array(z.lazy(() => nodePropertySchema)).optional(),
});

export const nodePropertySchema: z.ZodType<INodeProperty> = z.lazy(() =>
  z.object({
    label: z.string(),
    name: z.string().nonempty(),
    type: z.enum(nodePropertyTypes),
    description: z.string().optional(),
    hint: z.string().optional(),
    placeholder: z.string().optional(),
    optional: z.boolean().optional(),
    noDataExpression: z.boolean().optional(),
    disabledOptions: nodePropertyDisplayOptionsSchema.optional(),
    displayOptions: nodePropertyDisplayOptionsSchema.optional(),
    options: z.array(nodePropertyOptionSchema).optional(),
    hidden: z.boolean().optional(),
    loadMethod: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    default: z
      .lazy(() =>
        z.union([
          commonPrimitiveTypesSchema,
          z.array(commonPrimitiveTypesSchema),
        ]),
      )
      .optional(),
    collection: z.array(z.lazy(() => nodePropertySchema)).optional(),
    isMultiline: z.boolean().optional(),
    minNumber: z.number().optional(),
    maxNumber: z.number().optional(),
    gridItems: z.array(nodeGridItemSchema).optional(),
  }),
);

export const nodeCredentialDescriptionSchema = z.object({
  name: z.enum(credentialNames),
  optional: z.boolean().optional(),
  label: z.string().optional(),
  disabledOptions: nodeCredentialDisplayOptionsSchema.optional(),
  displayOptions: nodeCredentialDisplayOptionsSchema.optional(),
});

export const nodeHintSchema = z.object({
  message: z.string(),
  type: z.enum(["info", "warning", "danger"]).optional(),
  displayCondition: z.string().optional(),
  whenToDisplay: z
    .enum(["always", "beforeExecution", "afterExecution"])
    .optional(),
});

export const nodeVersionDescriptionSchema = z.object({
  version: z.number().nonnegative(),
  activationMessage: z.string().optional(),
  properties: z.array(nodePropertySchema),
  maxNodes: z.number().optional(),
  hints: z.array(nodeHintSchema).optional(),
  deprecateMessage: z.string().optional(),
  outputsShape: z.record(z.string(), z.any()).optional(),
});

export const nodeSerialisedSchema = nodeBaseDescriptionSchema.extend({
  currentVersion: z.number(),
  versions: z.array(nodeVersionDescriptionSchema).nonempty(),
});
