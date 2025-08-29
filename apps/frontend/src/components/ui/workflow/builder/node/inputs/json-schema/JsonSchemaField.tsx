import { FC, useState, useCallback, useEffect } from "react";
import { JsonSchemaFieldType, JsonSchemaType } from "./types";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";

const types = ["String", "Number", "Boolean", "Array", "Object"];

const JsonSchemaField: FC<{
  field: JsonSchemaFieldType;
  onFieldChange: (field: JsonSchemaFieldType) => void;
  onRemoveField: (id: string) => void;
  readOnly?: boolean;
}> = ({ field, onFieldChange, onRemoveField, readOnly = false }) => {
  const [localName, setLocalName] = useState(field.name);
  const [localDescription, setLocalDescription] = useState(field.description);

  useEffect(() => {
    setLocalName(field.name);
  }, [field.name]);

  useEffect(() => {
    setLocalDescription(field.description);
  }, [field.description]);

  const handleInputChange = <K extends keyof JsonSchemaFieldType>(
    key: K,
    value: JsonSchemaFieldType[K],
  ) => {
    onFieldChange({ ...field, [key]: value });
  };

  const handleNameBlur = useCallback(() => {
    if (localName !== field.name) {
      handleInputChange("name", localName);
    }
  }, [localName, field.name]);

  const handleDescriptionBlur = useCallback(() => {
    if (localDescription !== field.description) {
      handleInputChange("description", localDescription);
    }
  }, [localDescription, field.description]);

  const handleNestedFieldChange = (
    nestedField: JsonSchemaFieldType,
    index: number,
  ) => {
    const newProperties = [...(field.properties || [])];
    newProperties[index] = nestedField;
    handleInputChange("properties", newProperties);
  };

  const addNestedField = () => {
    const newField: JsonSchemaFieldType = {
      id: Date.now().toString(),
      name: "",
      type: "string",
      description: "",
    };
    handleInputChange("properties", [...(field.properties || []), newField]);
  };

  const removeNestedField = (id: string) => {
    const newProperties = (field.properties || []).filter((f) => f.id !== id);
    handleInputChange("properties", newProperties);
  };

  const handleArrayItemTypeChange = (type: JsonSchemaType) => {
    onFieldChange({
      ...field,
      items: {
        type,
        ...(type === "object" && { properties: [] }),
      },
    });
  };

  const addArrayNestedField = () => {
    const newField: JsonSchemaFieldType = {
      id: Date.now().toString(),
      name: "",
      type: "string",
      description: "",
    };
    const newProperties = [...(field.items?.properties || []), newField];
    onFieldChange({
      ...field,
      items: { ...field.items!, properties: newProperties },
    });
  };

  const handleArrayNestedFieldChange = (
    nestedField: JsonSchemaFieldType,
    index: number,
  ) => {
    const newProperties = [...(field.items?.properties || [])];
    newProperties[index] = nestedField;
    onFieldChange({
      ...field,
      items: { ...field.items!, properties: newProperties },
    });
  };

  const removeArrayNestedField = (id: string) => {
    const newProperties = (field.items?.properties || []).filter(
      (f) => f.id !== id,
    );
    onFieldChange({
      ...field,
      items: { ...field.items!, properties: newProperties },
    });
  };

  return (
    <div className="flex flex-col gap-2 p-2 border border-default-200 rounded-md">
      <div className="grid grid-cols-12 gap-3 items-center">
        <Input
          label="Field Name"
          value={localName}
          onChange={readOnly ? undefined : (e) => setLocalName(e.target.value)}
          onBlur={readOnly ? undefined : handleNameBlur}
          className="col-span-4"
          isReadOnly={readOnly}
          classNames={{
            input: "focus:outline-none focus:ring-0 focus:ring-offset-0 ",
          }}
        />
        <Select
          label="Type"
          selectedKeys={[field.type]}
          onChange={
            readOnly
              ? undefined
              : (e) =>
                  handleInputChange("type", e.target.value as JsonSchemaType)
          }
          className="col-span-3"
          isDisabled={readOnly}
          classNames={{
            trigger:
              "focus:outline-none focus-visible:outline-none " +
              "ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 " +
              "bg-default-100 hover:bg-default-200 border-none transition-colors",
          }}
        >
          {types.map((type) => (
            <SelectItem key={type.toLowerCase()}>{type}</SelectItem>
          ))}
        </Select>
        <Input
          label="Description"
          value={localDescription}
          onChange={
            readOnly ? undefined : (e) => setLocalDescription(e.target.value)
          }
          onBlur={readOnly ? undefined : handleDescriptionBlur}
          className="col-span-4"
          isReadOnly={readOnly}
          classNames={{
            input: "focus:outline-none focus:ring-0 focus:ring-offset-0 ",
          }}
        />
        {!readOnly && (
          <Button
            isIconOnly
            variant="light"
            onPress={() => onRemoveField(field.id)}
            className="col-span-1 justify-self-end hover:border-transparent focus:outline-none"
          >
            <Icon icon={"lucide:trash"} className="h-5 w-5 text-danger-500" />
          </Button>
        )}
      </div>

      {field.type === "object" && (
        <div className="flex flex-col gap-2 pl-4 mt-2">
          {field.properties?.map((nestedField, index) => (
            <JsonSchemaField
              key={nestedField.id}
              field={nestedField}
              onFieldChange={(f) => handleNestedFieldChange(f, index)}
              onRemoveField={removeNestedField}
              readOnly={readOnly}
            />
          ))}
          {!readOnly && (
            <Button
              startContent={<Icon icon={"lucide:plus"} className="h-4 w-4" />}
              onPress={addNestedField}
              size="sm"
              className="self-start bg-default-100 hover:bg-default-200 hover:border-transparent focus:outline-none text-default-700"
            >
              Add Property
            </Button>
          )}
        </div>
      )}

      {field.type === "array" && (
        <div className="flex flex-col gap-2 pl-4 mt-2">
          <Select
            label="Array Item Type"
            selectedKeys={field.items?.type ? [field.items.type] : []}
            onChange={
              readOnly
                ? undefined
                : (e) =>
                    handleArrayItemTypeChange(e.target.value as JsonSchemaType)
            }
            isDisabled={readOnly}
            classNames={{
              trigger:
                "focus:outline-none focus-visible:outline-none " +
                "ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 " +
                "bg-default-100 hover:bg-default-200 border-none transition-colors",
            }}
          >
            <SelectItem key="string">String</SelectItem>
            <SelectItem key="number">Number</SelectItem>
            <SelectItem key="boolean">Boolean</SelectItem>
            <SelectItem key="object">Object</SelectItem>
          </Select>
          {field.items?.type === "object" && (
            <div className="flex flex-col gap-2 pl-4 mt-2">
              {field.items.properties?.map((nestedField, index) => (
                <JsonSchemaField
                  key={nestedField.id}
                  field={nestedField}
                  onFieldChange={(f) => handleArrayNestedFieldChange(f, index)}
                  onRemoveField={removeArrayNestedField}
                  readOnly={readOnly}
                />
              ))}
              {!readOnly && (
                <Button
                  startContent={
                    <Icon icon={"lucide:plus"} className="h-4 w-4" />
                  }
                  onPress={addArrayNestedField}
                  size="sm"
                  className="self-start bg-default-100 hover:bg-default-200 hover:border-transparent focus:outline-none text-default-700"
                >
                  Add Property
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JsonSchemaField;
