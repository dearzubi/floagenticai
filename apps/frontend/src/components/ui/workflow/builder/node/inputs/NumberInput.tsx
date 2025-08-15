import { FC, useEffect, useState } from "react";
import { INodeProperty } from "common";
import { Input } from "@heroui/react";
import { getPropertyInputValue } from "../utils.ts";
import Label from "./Label.tsx";

const NumberInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
}> = ({ property, inputs, propertyPath, onInputChange, readOnly = false }) => {
  const initialValue = getPropertyInputValue(
    inputs,
    propertyPath,
    typeof property.default === "number" ? property.default : null,
  );

  const [value, setValue] = useState(String(initialValue ?? ""));

  useEffect(() => {
    const initialValueString = String(initialValue ?? "");
    if (initialValueString !== value) {
      setValue(initialValueString.trim());
    }
  }, [initialValue]);

  const min =
    property.minNumber ?? (property.type === "positiveNumber" ? 0 : undefined);
  const max = property.maxNumber;

  return (
    <div className="flex flex-col gap-2">
      <Label property={property} />
      <Input
        type="number"
        min={min}
        max={max}
        placeholder={property.placeholder ?? " "}
        value={value}
        onValueChange={readOnly ? undefined : setValue}
        onBlur={
          readOnly
            ? undefined
            : () => {
                const numValue = value === "" ? null : Number(value);
                if (numValue !== initialValue) {
                  onInputChange?.(propertyPath, numValue);
                }
              }
        }
        classNames={{
          innerWrapper:
            "focus-within:!outline-none focus-within:!ring-transparent focus-within:!ring-offset-0",
          input: "focus:outline-none focus:ring-0 focus:ring-offset-0",
        }}
        aria-label={property.label}
        step="any"
        isClearable={!readOnly}
        isReadOnly={readOnly}
      />
    </div>
  );
};

export default NumberInput;
