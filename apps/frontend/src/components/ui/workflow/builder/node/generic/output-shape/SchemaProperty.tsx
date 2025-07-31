import { FC, useState } from "react";
import { JSONSchemaDraft07 } from "common";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

const getFriendlyTypeName = (schema: JSONSchemaDraft07): string => {
  if (!schema) {
    return "any";
  }

  switch (schema.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    // TODO: Show array shape later, and handle correct references in resolution
    case "array": {
      if (!schema.items) {
        return "array";
      }
      if (Array.isArray(schema.items)) {
        return `array of [${schema.items.map(getFriendlyTypeName).join(", ")}]`;
      }
      return `array of ${getFriendlyTypeName(schema.items as JSONSchemaDraft07)}`;
    }
    default:
      return "string";
  }
};

const SchemaProperty: FC<{
  name: string;
  schema: JSONSchemaDraft07;
  isRequired: boolean;
  level?: number;
}> = ({ name, schema, isRequired, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1);

  const hasProperties =
    schema.type === "object" &&
    schema.properties &&
    Object.keys(schema.properties).length > 0;

  const isArrayOfObjects =
    schema.type === "array" &&
    !Array.isArray(schema.items) &&
    (schema.items as JSONSchemaDraft07)?.type === "object" &&
    (schema.items as JSONSchemaDraft07)?.properties &&
    Object.keys((schema.items as JSONSchemaDraft07).properties!).length > 0;

  return (
    <div className="text-sm border-b border-gray-100 last:border-b-0">
      <div
        className="flex items-center gap-2 py-3"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {hasProperties || isArrayOfObjects ? (
          <Button
            isIconOnly
            onPress={() => setIsOpen(!isOpen)}
            className="ml-1 p-[1px] rounded-full focus:outline-none hover:border-transparent w-fit h-fit min-w-fit min-h-fit bg-transparent"
            size="sm"
          >
            <Icon
              icon={
                isOpen
                  ? "radix-icons:chevron-down"
                  : "radix-icons:chevron-right"
              }
              className="size-3"
            />
          </Button>
        ) : (
          <div className="size-5" />
        )}

        <code className="font-semibold text-gray-800 text-xs">{name}</code>

        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
          {getFriendlyTypeName(schema)}
        </span>
        {!isRequired && (
          <span className="text-xs text-warning-500 font-medium">Optional</span>
        )}
      </div>
      {(hasProperties || isArrayOfObjects) && isOpen && (
        <div className="bg-gray-50/50">
          {hasProperties
            ? Object.entries(schema.properties!).map(([key, value]) => (
                <SchemaProperty
                  key={key}
                  name={key}
                  schema={value as JSONSchemaDraft07}
                  isRequired={schema.required?.includes(key) || false}
                  level={level + 1}
                />
              ))
            : Object.entries(
                (schema.items as JSONSchemaDraft07).properties!,
              ).map(([key, value]) => (
                <SchemaProperty
                  key={key}
                  name={key}
                  schema={value as JSONSchemaDraft07}
                  isRequired={
                    (schema.items as JSONSchemaDraft07).required?.includes(
                      key,
                    ) || false
                  }
                  level={level + 1}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default SchemaProperty;
