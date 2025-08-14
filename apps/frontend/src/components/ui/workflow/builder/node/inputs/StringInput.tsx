import { FC, useEffect, useState } from "react";
import { INodeProperty } from "common";
import { Input, Textarea } from "@heroui/react";
import { getPropertyInputValue } from "../utils.ts";
import Label from "./Label.tsx";

const StringInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
}> = ({ property, inputs, propertyPath, onInputChange, readOnly = false }) => {
  const initialValue = getPropertyInputValue(
    inputs,
    propertyPath,
    typeof property.default === "string" ? property.default : "",
  );

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  return (
    <div className="flex flex-col gap-2">
      <Label property={property} />
      {property.isMultiline ? (
        <Textarea
          placeholder={property.placeholder ?? " "}
          value={value}
          onValueChange={readOnly ? undefined : setValue}
          onBlur={
            readOnly
              ? undefined
              : () => {
                  if (value !== initialValue) {
                    onInputChange?.(propertyPath, value);
                  }
                }
          }
          aria-label={property.label}
          isClearable={!readOnly}
          isReadOnly={readOnly}
          classNames={{
            clearButton:
              "!bg-transparent !text-gray-500 hover:!text-gray-700 border-none focus:outline-none transition-colors",
            input: "focus:outline-none focus:ring-0 focus:ring-offset-0",
          }}
        />
      ) : (
        <Input
          placeholder={property.placeholder ?? " "}
          value={value}
          onValueChange={readOnly ? undefined : setValue}
          onBlur={
            readOnly
              ? undefined
              : () => {
                  if (value !== initialValue) {
                    onInputChange?.(propertyPath, value);
                  }
                }
          }
          aria-label={property.label}
          isClearable={!readOnly}
          isReadOnly={readOnly}
          classNames={{
            clearButton:
              "!bg-transparent !text-gray-500 hover:!text-gray-700 border-none focus:outline-none transition-colors",
            innerWrapper:
              "focus-within:!outline-none focus-within:!ring-transparent focus-within:!ring-offset-0",
            input: "focus:outline-none focus:ring-0 focus:ring-offset-0",
          }}
        />
      )}
    </div>
  );
};

export default StringInput;
