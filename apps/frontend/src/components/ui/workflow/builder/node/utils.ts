import {
  INodeProperty,
  NodeCredentialDescription,
  NodePropertyDisplayConditions,
  nodePropertyDisplayConditionsSchema,
  NodeSerialised,
  WorkflowBuilderUINodeData,
} from "common";
import { Node as ReactFlowNode } from "@xyflow/react";
import { PathValue, Path } from "./types.ts";

/**
 * Generates a unique node ID based on the provided node data and existing React Flow nodes.
 *
 * @param {NodeSerialised | WorkflowBuilderUINodeData} nodeData - The data for the node that requires a unique ID. The `name` property of the node data is used as the base for generating the ID.
 * @param {ReactFlowNode[]} reactFlowNodes - The list of existing React Flow nodes to check for ID conflicts.
 * @returns {string} A unique node ID that does not conflict with existing node IDs in the `reactFlowNodes` array.
 */
export const getUniqueNodeId = (
  nodeData: NodeSerialised | WorkflowBuilderUINodeData,
  reactFlowNodes: ReactFlowNode[],
): string => {
  let suffix = 0;

  let nodeId = `${nodeData.name}_${suffix}`;

  while (reactFlowNodes.some((node) => node.id === nodeId)) {
    suffix += 1;
    nodeId = `${nodeData.name}_${suffix}`;
  }

  return nodeId;
};

/**
 * Function to initialize input properties based on a given set of node properties.
 * This ensures that all properties are initialized either with their default values
 * or null if no default is specified. For properties of type "propertyCollection",
 * the function recursively initializes their child collections.
 *
 * @param {INodeProperty[]} properties - The array of node properties that need to be initialized.
 * @param {Record<string, unknown>} inputs - An object to store the initialized property values.
 * @returns {Record<string, unknown>} The resulting object with all properties initialized.
 */
const initialisePropertyInputs = (
  properties: INodeProperty[],
  inputs: Record<string, unknown>,
): Record<string, unknown> => {
  if (properties.length === 0) {
    return inputs;
  }
  for (const property of properties) {
    if (property.type === "propertyCollection" && property.collection) {
      inputs[property.name] = initialisePropertyInputs(property.collection, {});
    } else if (property.type === "array" && property.collection) {
      inputs[property.name] = [];
    } else {
      // Ensure all properties are initialised either with default or null,
      // and it will be preserved when serialised to JSON for API request
      inputs[property.name] = property.default ?? null;
    }
  }
  return inputs;
};

export const initReactFlowNodeData = (
  node: NodeSerialised,
  reactFlowNodes: ReactFlowNode[],
): WorkflowBuilderUINodeData => {
  const { versions, ...rest } = node;

  const id = getUniqueNodeId(node, reactFlowNodes);
  const idParts = id.split("_");

  return {
    id: id,
    ...rest,
    friendlyName: `${node.label} ${idParts[idParts.length - 1]}`,
    versions: versions.map((version) => ({
      ...version,
      inputs: initialisePropertyInputs(version.properties, {}),
      credentialIds: [],
    })),
  } satisfies WorkflowBuilderUINodeData;
};

/**
 * Gets a nested value from an object using a type-safe dot notation path.
 * If an intermediate value in the path is null, it returns null.
 *
 * @param obj - The object to traverse.
 * @param path - A type-safe dot notation path (e.g., "a.b.c").
 * @returns The value at the path, with its correct type.
 */
export const getNestedValue = <T extends object, P extends Path<T>>(
  obj: T,
  path: P,
): PathValue<T, P> | undefined | null => {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null) {
      return null;
    }

    if (current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current as PathValue<T, P>;
};

/**
 * Sets a nested value in an object using dot notation path
 * @param obj - The object to modify
 * @param path - Dot notation path (e.g., "a.b.c")
 * @param value - The value to set
 */
export const setNestedValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void => {
  if (!path) {
    return;
  }

  const keys = path.split(".");
  let current: unknown = obj;

  const isIndex = (k: string): boolean => /^\d+$/.test(k);

  // Navigate to the parent of the target property
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    const createContainer = isIndex(nextKey) ? [] : {};

    if (Array.isArray(current)) {
      const idx = Number(key);
      if (current[idx] === undefined) {
        current[idx] = createContainer;
      }

      current = current[idx];
    } else {
      const currObj = current as Record<string, unknown>;
      if (
        !(key in currObj) ||
        currObj[key] === null ||
        typeof currObj[key] !== "object"
      ) {
        currObj[key] = createContainer;
      }
      current = currObj[key] as unknown;
    }
  }

  // Set the final property
  const finalKey = keys[keys.length - 1];
  if (Array.isArray(current) && isIndex(finalKey)) {
    current[Number(finalKey)] = value;
  } else {
    (current as Record<string, unknown>)[finalKey] = value;
  }
};

/**
 * Helper function for value comparison with type coercion
 */
const compareValues = (
  inputValue: unknown,
  compareValue: string | number,
  operator: ">=" | "<=" | ">" | "<",
): boolean => {
  if (inputValue === null || inputValue === undefined) {
    return false;
  }

  // Try numeric comparison first
  const inputNum = Number(inputValue);
  const compareNum = Number(compareValue);

  if (!isNaN(inputNum) && !isNaN(compareNum)) {
    switch (operator) {
      case ">=":
        return inputNum >= compareNum;
      case "<=":
        return inputNum <= compareNum;
      case ">":
        return inputNum > compareNum;
      case "<":
        return inputNum < compareNum;
    }
  }

  // Fall back to string comparison
  const inputStr = String(inputValue);
  const compareStr = String(compareValue);

  switch (operator) {
    case ">=":
      return inputStr >= compareStr;
    case "<=":
      return inputStr <= compareStr;
    case ">":
      return inputStr > compareStr;
    case "<":
      return inputStr < compareStr;
  }

  return false;
};

/**
 * Evaluates a single display condition against an input value
 */
const evaluateCondition = (
  condition: NodePropertyDisplayConditions["_cnd"],
  inputValue: unknown,
): boolean => {
  if ("eq" in condition) {
    return inputValue === condition.eq;
  }

  if ("not" in condition) {
    return inputValue !== condition.not;
  }

  if ("exists" in condition) {
    return inputValue !== undefined && inputValue !== null && inputValue !== "";
  }

  if ("gte" in condition) {
    return compareValues(inputValue, condition.gte, ">=");
  }

  if ("lte" in condition) {
    return compareValues(inputValue, condition.lte, "<=");
  }

  if ("gt" in condition) {
    return compareValues(inputValue, condition.gt, ">");
  }

  if ("lt" in condition) {
    return compareValues(inputValue, condition.lt, "<");
  }

  if ("between" in condition) {
    const { from, to } = condition.between;
    return (
      compareValues(inputValue, from, ">=") &&
      compareValues(inputValue, to, "<=")
    );
  }

  if ("startsWith" in condition) {
    return (
      typeof inputValue === "string" &&
      inputValue.startsWith(condition.startsWith)
    );
  }

  if ("endsWith" in condition) {
    return (
      typeof inputValue === "string" && inputValue.endsWith(condition.endsWith)
    );
  }

  if ("includes" in condition) {
    return (
      typeof inputValue === "string" && inputValue.includes(condition.includes)
    );
  }

  if ("regex" in condition) {
    if (typeof inputValue !== "string") {
      return false;
    }
    try {
      const regex = new RegExp(condition.regex);
      return regex.test(inputValue);
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Evaluates whether a condition or value matches the input
 */
const evaluateConditionOrValue = (
  conditionOrValue: unknown,
  inputValue: unknown,
): boolean => {
  if (
    typeof conditionOrValue === "string" ||
    typeof conditionOrValue === "number" ||
    typeof conditionOrValue === "boolean" ||
    conditionOrValue === null
  ) {
    return inputValue === conditionOrValue;
  }

  if (typeof conditionOrValue === "object" && "_cnd" in conditionOrValue) {
    try {
      const validatedCondition =
        nodePropertyDisplayConditionsSchema.parse(conditionOrValue);
      return evaluateCondition(validatedCondition._cnd, inputValue);
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Resolves input value considering nested paths and property collections
 * @param inputs - The inputs object (can be nested)
 * @param propertyPath - The property path (can use dot notation)
 * @param currentPath - Current path context for nested properties
 * @returns The resolved input value
 */
const resolveInputValue = (
  inputs: Record<string, unknown>,
  propertyPath: string,
  currentPath?: string,
): unknown => {
  // If we have a current path context (for nested properties),
  // we need to resolve relative to that context
  if (currentPath) {
    // Try the relative path first (for properties within the same collection)
    const relativePath = `${currentPath}.${propertyPath}`;
    const relativeValue = getNestedValue(inputs, relativePath);
    if (relativeValue !== undefined) {
      return relativeValue;
    }
  }

  if (propertyPath.includes(".")) {
    return getNestedValue(inputs, propertyPath);
  }

  return inputs[propertyPath];
};

/**
 * Helper function to determine if a property should be displayed
 * @param property - The node property with display options
 * @param inputs - Record of all input values (can be nested)
 * @param currentVersion - Current node version (optional, for @version conditions)
 * @param currentPath - Current property path context (for nested properties)
 * @returns boolean indicating whether the property should be displayed
 */
export const shouldDisplayProperty = (
  property: INodeProperty,
  inputs: Record<string, unknown>,
  currentPath?: string,
  currentVersion?: number,
): boolean => {
  if (property.hidden) {
    return false;
  }

  if (!property.displayOptions) {
    return true;
  }

  const { show, hide } = property.displayOptions;

  // Check hide conditions first
  if (hide) {
    for (const [propertyPath, conditions] of Object.entries(hide)) {
      const inputValue = resolveInputValue(inputs, propertyPath, currentPath);

      // If any hide condition matches, hide the property
      const shouldHide = conditions.some((condition) =>
        evaluateConditionOrValue(condition, inputValue),
      );

      if (shouldHide) {
        return false;
      }
    }
  }

  if (show) {
    let hasShowConditions = false;
    let shouldShow = false;

    for (const [propertyPath, conditions] of Object.entries(show)) {
      if (!conditions || conditions.length === 0) {
        continue;
      }

      hasShowConditions = true;

      // Handle special @version property
      if (propertyPath === "@version") {
        if (currentVersion !== undefined) {
          const versionMatches = conditions.some((condition) =>
            evaluateConditionOrValue(condition, currentVersion),
          );
          if (versionMatches) {
            shouldShow = true;
            break;
          }
        }
        continue;
      }

      const inputValue = resolveInputValue(inputs, propertyPath, currentPath);
      const conditionMatches = conditions.some((condition) =>
        evaluateConditionOrValue(condition, inputValue),
      );

      if (conditionMatches) {
        shouldShow = true;
        break;
      }
    }

    // If there are show conditions but none match, hide the property
    if (hasShowConditions && !shouldShow) {
      return false;
    }
  }

  return true;
};

/**
 * Helper function to determine if a credential should be displayed
 * @param credential - The credential description with display options
 * @param inputs - Record of all input values (can be nested)
 * @param currentVersion - Current node version (optional, for @version conditions)
 * @returns boolean indicating whether the credential should be displayed
 */
export const shouldDisplayCredential = (
  credential: NodeCredentialDescription,
  inputs: Record<string, unknown>,
  currentVersion?: number,
): boolean => {
  if (!credential.displayOptions) {
    return true;
  }

  const { show, hide } = credential.displayOptions;

  // Check hide conditions first
  if (hide) {
    for (const [propertyPath, conditions] of Object.entries(hide)) {
      if (!conditions || conditions.length === 0) {
        continue;
      }

      const inputValue = resolveInputValue(inputs, propertyPath);

      // If any hide condition matches, hide the credential
      const shouldHide = conditions.some((condition) =>
        evaluateConditionOrValue(condition, inputValue),
      );

      if (shouldHide) {
        return false;
      }
    }
  }

  if (show) {
    let hasShowConditions = false;
    let shouldShow = false;

    for (const [propertyPath, conditions] of Object.entries(show)) {
      if (!conditions || conditions.length === 0) {
        continue;
      }

      hasShowConditions = true;

      // Handle special @version property
      if (propertyPath === "@version") {
        if (currentVersion !== undefined) {
          const versionMatches = conditions.some((condition) =>
            evaluateConditionOrValue(condition, currentVersion),
          );
          if (versionMatches) {
            shouldShow = true;
            break;
          }
        }
        continue;
      }

      const inputValue = resolveInputValue(inputs, propertyPath);
      const conditionMatches = conditions.some((condition) =>
        evaluateConditionOrValue(condition, inputValue),
      );

      if (conditionMatches) {
        shouldShow = true;
        break;
      }
    }

    // If there are show conditions but none match, hide the credential
    if (hasShowConditions && !shouldShow) {
      return false;
    }
  }

  return true;
};

/**
 * Helper to filter visible properties from a list, handling nested collections
 * @param properties - Array of properties to filter
 * @param inputs - Input values object
 * @param currentVersion - Current version
 * @param currentPath - Current path context for nested properties
 * @returns Array of visible properties with nested collections also filtered
 */
export const getVisibleProperties = (
  properties: INodeProperty[],
  inputs: Record<string, unknown>,
  currentPath?: string,
  currentVersion?: number,
): INodeProperty[] => {
  return properties
    .filter((property) =>
      shouldDisplayProperty(property, inputs, currentPath, currentVersion),
    )
    .map((property) => {
      if (property.type === "propertyCollection" && property.collection) {
        const nestedPath = currentPath
          ? `${currentPath}.${property.name}`
          : property.name;

        return {
          ...property,
          collection: getVisibleProperties(
            property.collection,
            inputs,
            nestedPath,
            currentVersion,
          ),
        };
      }

      return property;
    });
};

/**
 * Helper to filter visible credentials from a list
 * @param credentials - Array of credentials to filter
 * @param inputs - Input values object
 * @param currentVersion - Current version
 * @returns Array of visible credentials
 */
export const getVisibleCredentials = (
  credentials: NodeCredentialDescription[],
  inputs: Record<string, unknown>,
  currentVersion?: number,
): NodeCredentialDescription[] => {
  return credentials.filter((credential) =>
    shouldDisplayCredential(credential, inputs, currentVersion),
  );
};

/**
 * Helper to get all property paths in a nested structure (useful for debugging)
 */
export function getAllPropertyPaths(
  properties: INodeProperty[],
  prefix: string = "",
): string[] {
  const paths: string[] = [];

  for (const property of properties) {
    const currentPath = prefix ? `${prefix}.${property.name}` : property.name;
    paths.push(currentPath);

    if (property.type === "propertyCollection" && property.collection) {
      paths.push(...getAllPropertyPaths(property.collection, currentPath));
    }
  }

  return paths;
}

/**
 * Retrieves the value of a property from a nested object structure based on a specified path.
 * If the property does not exist or its value is invalid, a default value is returned.
 *
 * @param {Record<string, unknown>} inputs - The object containing nested properties.
 * @param {string} fullPath - The full path of the property in dot notation.
 * @param {CommonPrimitiveTypes} _default - The default value to return if the property is not found or invalid.
 * @returns {CommonPrimitiveTypes} - The value of the nested property, or the default value if not found or invalid.
 */
export const getPropertyInputValue = <T>(
  inputs: Record<string, unknown>,
  fullPath: string,
  _default: T,
): T => {
  const inputValue = getNestedValue(inputs, fullPath);

  if (
    typeof inputValue === "undefined" ||
    inputValue === null ||
    typeof inputValue === "object"
  ) {
    return _default as T;
  }

  return inputValue as T;
};
