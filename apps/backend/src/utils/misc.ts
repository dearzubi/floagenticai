import { findUpSync } from "find-up";
import { fileURLToPath } from "url";
import { dirname } from "path";

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
