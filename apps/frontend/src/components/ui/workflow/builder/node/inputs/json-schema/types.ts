export type JsonSchemaType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array";

export interface JsonSchemaFieldType {
  id: string;
  name: string;
  type: JsonSchemaType;
  description: string;
  properties?: JsonSchemaFieldType[];
  items?: { type: JsonSchemaType; properties?: JsonSchemaFieldType[] };
}

export interface Draft07Schema {
  type?: string | string[];
  description?: string;
  properties?: Record<string, Draft07Schema>;
  items?: Draft07Schema;
}
