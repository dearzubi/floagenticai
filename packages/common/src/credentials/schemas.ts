import { z } from "zod/v4";
import { credentialNames, credentialPropertyTypes } from "./constants.js";
import { commonPrimitiveTypesSchema } from "../shared/index.js";

const credentialPropertyOptionSchema = z.object({
  name: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const credentialPropertySchema = z.object({
  label: z.string(),
  name: z.string().nonempty(),
  type: z.enum(credentialPropertyTypes),
  description: z.string().optional(),
  hint: z.string().optional(),
  placeholder: z.string().optional(),
  optional: z.boolean().optional(),
  options: z.array(credentialPropertyOptionSchema).optional(),
  default: commonPrimitiveTypesSchema.optional(),
  isMultiline: z.boolean().optional(),
});

export const credentialSchema = z.object({
  name: z.enum(credentialNames),
  label: z.string(),
  icon: z.string().optional(),
  properties: z.array(credentialPropertySchema),
});
