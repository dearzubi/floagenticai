import { z } from "zod/v4";

export const commonPrimitiveTypesSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.null(),
  z.undefined(),
]);
