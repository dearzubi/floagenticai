import { FC, useEffect, useState } from "react";
import { INodeProperty } from "common";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Draft07Schema, JsonSchemaFieldType } from "./types";
import { draft07ToFields, generateDraft07Schema } from "./utils";
import JsonSchemaField from "./JsonSchemaField";
import Label from "../Label";
import { getPropertyInputValue } from "../../utils.ts";

const JsonSchemaInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
}> = ({ property, inputs, propertyPath, onInputChange, readOnly = false }) => {
  const [fields, setFields] = useState<JsonSchemaFieldType[]>([]);

  useEffect(() => {
    const initialValue = getPropertyInputValue(inputs, propertyPath, undefined);

    if (Array.isArray(initialValue)) {
      setFields(initialValue as JsonSchemaFieldType[]);
    } else if (
      initialValue &&
      typeof initialValue === "object" &&
      "properties" in initialValue
    ) {
      setFields(draft07ToFields(initialValue as Draft07Schema));
    }
  }, [inputs, property.name]);

  const handleFieldsChange = (newFields: JsonSchemaFieldType[]) => {
    setFields(newFields);
    if (onInputChange) {
      const schema = generateDraft07Schema(newFields);
      onInputChange(propertyPath, schema);
    }
  };

  const addField = () => {
    const newField: JsonSchemaFieldType = {
      id: Date.now().toString(),
      name: "",
      type: "string",
      description: "",
    };
    handleFieldsChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    handleFieldsChange(fields.filter((field) => field.id !== id));
  };

  const handleFieldChange = (field: JsonSchemaFieldType, index: number) => {
    const newFields = [...fields];
    newFields[index] = field;
    handleFieldsChange(newFields);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label property={property} />
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <JsonSchemaField
            key={field.id}
            field={field}
            onFieldChange={(f) => handleFieldChange(f, index)}
            onRemoveField={removeField}
            readOnly={readOnly}
          />
        ))}
      </div>
      {!readOnly && (
        <Button
          startContent={<Icon icon="lucide:plus" className="h-4 w-4" />}
          onPress={addField}
          className="self-start bg-default-100 hover:bg-default-200 hover:border-transparent focus:outline-none text-default-700"
        >
          Add Field
        </Button>
      )}
    </div>
  );
};

export default JsonSchemaInput;
