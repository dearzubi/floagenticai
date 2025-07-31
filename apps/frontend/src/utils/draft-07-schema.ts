import Ajv from "ajv";
import draft07MetaSchema from "ajv/lib/refs/json-schema-draft-07.json";
import { JSONSchemaDraft07 } from "common";

const ajv = new Ajv({
  strict: false,
  allErrors: true,
  validateSchema: true,
});

/**
 * Validate a JSON-Schema draft-07 definition.
 *
 * NOTE: This validates *the schema itself* — it does run a data-validation function.
 */
export const validateDraft07JSONSchema = (
  schema: JSONSchemaDraft07,
): boolean => {
  const validate = ajv.compile(draft07MetaSchema);
  return validate(schema);
};
