import { z as zodv3, ZodTypeAny } from "zod";
import { JSONSchemaDraft07 } from "./types.js";
import { ZodType } from "zod/v4";

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

/**
 * Safely parses a JSON string into a JavaScript object.
 *
 * This utility function attempts to parse a JSON string and return the resulting object.
 * In case of a parsing error, it returns a fallback value to prevent the application
 * from throwing an exception. By default, the fallback value is null.
 * It can also optionally validate the parsed object against a Zod schema.
 *
 * @param {string} jsonString - The JSON string to be parsed.
 * @param {ZodType} schema - An optional Zod schema to validate the parsed object. Default: `undefined`
 * @param {Record<string, unknown>} [returnValueOnError={}] - The default fallback value
 * to return if parsing fails. Defaults to an empty object.
 * @returns {Record<string, unknown>} The parsed JavaScript object if the JSON string is valid;
 * otherwise, the provided `returnValueOnError` value.
 */
export const safeParseJSON = <
  T = unknown,
  F extends
    | Record<string, unknown>
    | null
    | undefined
    | string
    | number
    | boolean = null,
>(
  jsonString: string | null | undefined,
  schema?: ZodType<T>,
  returnValueOnError: F = null as F,
): T | F => {
  if (!jsonString) {
    return returnValueOnError;
  }
  try {
    const parsed = JSON.parse(jsonString) as T;
    if (!schema) {
      return parsed;
    }
    return schema.parse(parsed) as T;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return returnValueOnError;
  }
};
