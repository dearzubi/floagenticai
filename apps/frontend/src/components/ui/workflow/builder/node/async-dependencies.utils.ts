import { INodeProperty } from "common";
import { getNestedValue } from "./utils.ts";

/**
 * Extracts the relevant input dependencies for an async property
 * @param property - The async property to analyze
 * @returns Array of input paths that this async property depends on
 */
export const extractAsyncPropertyDependencies = (
  property: INodeProperty,
): string[] => {
  const dependencies: Set<string> = new Set();

  if (property.dependencies && Array.isArray(property.dependencies)) {
    property.dependencies.forEach((dep) => {
      dependencies.add(dep);
    });
  } else {
    // Fallback: Extract dependencies from displayOptions.show
    if (property.displayOptions?.show) {
      Object.keys(property.displayOptions.show).forEach((key) => {
        dependencies.add(key);
      });
    }

    // Fallback: Extract dependencies from displayOptions.hide
    if (property.displayOptions?.hide) {
      Object.keys(property.displayOptions.hide).forEach((key) => {
        dependencies.add(key);
      });
    }
  }

  return Array.from(dependencies);
};

/**
 * Creates a stable key for async property dependencies by extracting only relevant input values
 * @param inputs - All current inputs
 * @param dependencies - Array of dependency paths
 * @returns Object containing only the relevant input values for this async property
 */
export const extractRelevantInputs = (
  inputs: Record<string, unknown>,
  dependencies: string[],
): Record<string, unknown> => {
  const relevantInputs: Record<string, unknown> = {};

  dependencies.forEach((dep) => {
    const value = getNestedValue(inputs, dep);
    if (value !== undefined) {
      relevantInputs[dep] = value;
    }
  });

  return relevantInputs;
};

/**
 * Checks if the relevant inputs for an async property have changed
 * @param oldInputs - Previous input values
 * @param newInputs - Current input values
 * @param dependencies - Array of dependency paths to check
 * @returns True if any relevant input has changed
 */
export const hasRelevantInputsChanged = (
  oldInputs: Record<string, unknown>,
  newInputs: Record<string, unknown>,
  dependencies: string[],
): boolean => {
  const oldRelevant = extractRelevantInputs(oldInputs, dependencies);
  const newRelevant = extractRelevantInputs(newInputs, dependencies);

  return JSON.stringify(oldRelevant) !== JSON.stringify(newRelevant);
};

/**
 * Generates a stable cache key for async property data
 * @param nodeName - Name of the node
 * @param methodName - Name of the load method
 * @param relevantInputs - Only the relevant input values
 * @returns Array that can be used as TanStack Query key
 */
export const generateAsyncPropertyCacheKey = (
  nodeName: string,
  methodName: string,
  relevantInputs: Record<string, unknown>,
): (string | Record<string, unknown>)[] => {
  return [
    "workflow",
    "node",
    "load-method",
    nodeName,
    methodName,
    relevantInputs,
  ];
};
