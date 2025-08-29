export type JSONSchemaTypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JSONSchemaDraft07 {
  $id?: string;
  $schema?: string;
  $ref?: string;
  $comment?: string;

  title?: string;
  description?: string;
  default?: any;
  examples?: any[];

  type?: JSONSchemaTypeName | JSONSchemaTypeName[];
  enum?: any[];
  const?: any;

  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  maxLength?: number;
  minLength?: number;
  pattern?: string;

  items?: JSONSchemaDraft07 | JSONSchemaDraft07[];
  additionalItems?: boolean | JSONSchemaDraft07;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchemaDraft07;

  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: Record<string, JSONSchemaDraft07>;
  patternProperties?: Record<string, JSONSchemaDraft07>;
  additionalProperties?: boolean | JSONSchemaDraft07;
  dependencies?: Record<string, JSONSchemaDraft07 | string[]>;
  propertyNames?: JSONSchemaDraft07;

  if?: JSONSchemaDraft07;
  then?: JSONSchemaDraft07;
  else?: JSONSchemaDraft07;

  allOf?: JSONSchemaDraft07[];
  anyOf?: JSONSchemaDraft07[];
  oneOf?: JSONSchemaDraft07[];
  not?: JSONSchemaDraft07;

  definitions?: Record<string, JSONSchemaDraft07>;

  format?: string;

  [key: string]: any;
}
