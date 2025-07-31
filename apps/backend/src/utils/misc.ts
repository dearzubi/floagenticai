import { findUpSync } from "find-up";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { z } from "zod/v4";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Returns the absolute path of the backend directory.
 * Searches for the nearest package.json file where this function is called.
 * There is currently only one package.json file in the backend directory.
 * @returns {string} The absolute path of the backend directory.
 */
export const getBackendDirectoryAbsolutePath = (): string => {
  // Find the nearest package.json directory
  const packageJsonPath = findUpSync("package.json", { cwd: __dirname });
  if (!packageJsonPath) {
    // It is not possible to reach this point (because it's a Node.js project and package.json is present),
    // but just in case and especially to statisfy TypeScript
    throw new Error("Could not find package.json");
  }
  return dirname(packageJsonPath);
};

/**
 * Safely serializes a JavaScript object into a JSON string, handling circular references.
 *
 * This method allows converting an object into a JSON string while avoiding
 * issues caused by cyclic dependencies. If a circular reference is detected,
 * it will be excluded from the serialization process.
 *
 * Optionally accepts a custom replacer function and a space parameter to format the output.
 *
 * Note: This can be used as a drop-in replacement for the built-in JSON.stringify method.
 *
 * @param {Record<string, unknown>} obj - The object to be serialized into a JSON string.
 * @param {(key: string, value: any) => any} [replacer] - A transformation function that alters the behavior of the stringification process.
 * @param {string | number} [space] - A string or number used to control whitespace in the resulting JSON string for readability.
 * @returns {string} A JSON string representation of the input object.
 */
export const stringifyCircularJSON = (
  obj: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: (key: string, value: any) => any,
  space?: string | number,
): string => {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (k, v) => {
      if (v !== null && typeof v === "object") {
        if (seen.has(v)) {
          return;
        }
        seen.add(v);
      }
      if (replacer) {
        return replacer(k, v);
      }
      return v;
    },
    space,
  );
};

/**
 * Safely parses a JSON string into a JavaScript object.
 *
 * This utility function attempts to parse a JSON string and return the resulting object.
 * In case of a parsing error, it returns a fallback value to prevent the application
 * from throwing an exception. By default, the fallback value is null.
 * It can also optionally validate the parsed object against a Zod schema.
 *
 * @param {string} jsonString - The JSON string to be parsed.
 * @param {z.ZodType} schema - An optional Zod schema to validate the parsed object. Default: `undefined`
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
  schema?: z.ZodType<T>,
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
/**
 * Pauses the execution of asynchronous operations for a specified duration.
 *
 * @param {number} ms - The duration in milliseconds to delay the execution.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Removes all commas from a given string.
 * @param input - The string from which to remove commas.
 */
export const removeCommasFromString = (input: string): string => {
  return input.replace(/,/g, "").trim();
};
