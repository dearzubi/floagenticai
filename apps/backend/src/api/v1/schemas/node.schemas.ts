import { z } from "zod/v4";
import { APIRequestDataSchemas } from "./types.js";

const loadMethodSchema = {
  body: z.object({
    version: z.coerce.number().int().positive().optional(),
    nodeName: z.string().nonempty(),
    methodName: z.string().nonempty(),
    inputs: z.record(z.string(), z.unknown()).optional().default({}),
  }),
} satisfies APIRequestDataSchemas;

export const nodeAPIRequestSchemas = {
  loadMethod: loadMethodSchema,
};

export interface LoadMethodAPIRequestData {
  body: z.infer<typeof nodeAPIRequestSchemas.loadMethod.body>;
}
