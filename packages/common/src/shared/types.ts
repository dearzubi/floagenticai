import { z } from "zod/v4";
import { commonPrimitiveTypesSchema } from "./schemas.js";

export type CommonPrimitiveTypes = z.infer<typeof commonPrimitiveTypesSchema>;
