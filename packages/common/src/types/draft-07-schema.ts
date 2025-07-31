export type JSONSchemaTypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JSONSchemaDraft07 {
  // Core schema meta
  $id?: string;
  $schema?: string;
  $ref?: string;
  $comment?: string;

  // Basic metadata
  title?: string;
  description?: string;
  default?: any;
  examples?: any[];

  // Type and enum
  type?: JSONSchemaTypeName | JSONSchemaTypeName[];
  enum?: any[];
  const?: any;

  // Numeric validation
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  // String validation
  maxLength?: number;
  minLength?: number;
  pattern?: string;

  // Array validation
  items?: JSONSchemaDraft07 | JSONSchemaDraft07[];
  additionalItems?: boolean | JSONSchemaDraft07;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchemaDraft07;

  // Object validation
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: Record<string, JSONSchemaDraft07>;
  patternProperties?: Record<string, JSONSchemaDraft07>;
  additionalProperties?: boolean | JSONSchemaDraft07;
  dependencies?: {
    [key: string]: JSONSchemaDraft07 | string[];
  };
  propertyNames?: JSONSchemaDraft07;

  // Conditional subschemas
  if?: JSONSchemaDraft07;
  then?: JSONSchemaDraft07;
  else?: JSONSchemaDraft07;

  // Combining schemas
  allOf?: JSONSchemaDraft07[];
  anyOf?: JSONSchemaDraft07[];
  oneOf?: JSONSchemaDraft07[];
  not?: JSONSchemaDraft07;

  // Definitions and recursive anchors
  definitions?: {
    [key: string]: JSONSchemaDraft07;
  };

  // Format (non-validation hint)
  format?: string;

  // Custom extensions
  [key: string]: any;
}
