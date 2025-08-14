import { z as zodv3, ZodTypeAny } from "zod";
import { JSONSchemaDraft07 } from "./types.js";

/**
 * Recursively converts a JSON-Schema Draft-07 subtree into an equivalent Zod
 * schema (using Zod v3 to be compatible with OpenAI Agent SDK).
 * This function only supports a partial set of fields and types:
 * string, numbers, arrays, objects. All fields are assumed to be required.
 * There is no support for enums. This functions is supposed to be helper a function
 * to convert user defined agent structured output.
 */
export function convertJsonSchemaToZodSchema(
  schema: JSONSchemaDraft07,
): ZodTypeAny {
  const withDescription = (zod: ZodTypeAny): ZodTypeAny =>
    schema.description ? zod.describe(schema.description) : zod;

  // Get the primary type (handle both single type and array of types)
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (type) {
    case "string":
      return withDescription(zodv3.string());

    case "number":
      return withDescription(zodv3.number());

    case "integer":
      return withDescription(zodv3.number().int());

    case "boolean":
      return withDescription(zodv3.boolean());

    case "array": {
      const itemSchema = schema.items
        ? convertJsonSchemaToZodSchema(schema.items as JSONSchemaDraft07)
        : zodv3.any();
      return withDescription(zodv3.array(itemSchema));
    }

    case "object": {
      const props = schema.properties ?? {};
      const shape: Record<string, ZodTypeAny> = {};

      // All properties are required by default
      for (const [propName, propSchema] of Object.entries(props)) {
        shape[propName] = convertJsonSchemaToZodSchema(
          propSchema as JSONSchemaDraft07,
        );
      }

      return withDescription(zodv3.object(shape));
    }

    default:
      // Unknown or missing type - fallback to any
      return withDescription(zodv3.any());
  }
}
