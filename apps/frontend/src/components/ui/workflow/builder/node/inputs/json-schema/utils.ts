import { Draft07Schema, JsonSchemaFieldType, JsonSchemaType } from "./types";

/**
 * Given a list of `JsonSchemaFieldType`s, generate a JSON schema object
 * in the draft-07 format.
 *
 * @param {JsonSchemaFieldType[]} fields The list of fields to generate a schema
 * for.
 * @returns {Record<string, unknown>} The generated JSON schema object.
 */
export const generateDraft07Schema = (
  fields: JsonSchemaFieldType[],
): Record<string, unknown> => {
  const buildFieldSchema = (
    field: JsonSchemaFieldType,
  ): Record<string, unknown> => {
    const base: Record<string, unknown> = {};
    if (field.description) {
      base.description = field.description;
    }

    switch (field.type) {
      case "string":
      case "number":
      case "boolean":
        base.type = field.type;
        break;
      case "object": {
        base.type = "object";
        base.properties = {};
        base.additionalProperties = false;
        (field.properties || []).forEach((p) => {
          (base.properties as Record<string, unknown>)[p.name] =
            buildFieldSchema(p);
        });
        break;
      }
      case "array": {
        base.type = "array";
        if (field.items) {
          if (field.items.type === "object") {
            const objectItemSchema: Record<string, unknown> = {
              type: "object",
              properties: {},
              additionalProperties: false,
            };
            (field.items.properties || []).forEach((p) => {
              (objectItemSchema.properties as Record<string, unknown>)[p.name] =
                buildFieldSchema(p);
            });
            base.items = objectItemSchema;
          } else {
            base.items = { type: field.items.type };
          }
        }
        break;
      }
      default:
        break;
    }
    return base;
  };

  const schema: Record<string, unknown> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {},
    additionalProperties: false,
  };

  fields.forEach((field) => {
    (schema.properties as Record<string, unknown>)[field.name] =
      buildFieldSchema(field);
  });

  return schema;
};

export function draft07ToFields(schema: Draft07Schema): JsonSchemaFieldType[] {
  if (!schema || schema.type !== "object" || !schema.properties) {
    return [];
  }

  return Object.entries(schema.properties).map(([key, prop]) => {
    const id = crypto.randomUUID?.() ?? Date.now().toString();
    const type =
      ((Array.isArray(prop.type)
        ? prop.type[0]
        : prop.type) as JsonSchemaType) ?? "string";

    const field: JsonSchemaFieldType = {
      id,
      name: key,
      type,
      description: prop.description ?? "",
    };

    if (type === "object") {
      field.properties = draft07ToFields(prop);
    } else if (type === "array" && prop.items) {
      const itemType = Array.isArray(prop.items.type)
        ? prop.items.type[0]
        : prop.items.type;
      field.items = {
        type: itemType as JsonSchemaType,
        properties:
          itemType === "object" ? draft07ToFields(prop.items) : undefined,
      };
    }

    return field;
  });
}
