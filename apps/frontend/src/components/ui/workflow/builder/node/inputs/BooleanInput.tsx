import { FC } from "react";
import { INodeProperty } from "common";
import { Switch } from "@heroui/react";
import { getPropertyInputValue } from "../utils.ts";
import Label from "./Label.tsx";

const BooleanInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
}> = ({ property, inputs, propertyPath, onInputChange, readOnly = false }) => {
  const isSelected = getPropertyInputValue(
    inputs,
    propertyPath,
    typeof property.default === "boolean" ? property.default : false,
  );

  return (
    <div className="flex flex-col gap-2">
      <Label property={property} />
      <Switch
        size="sm"
        isSelected={isSelected}
        onValueChange={
          readOnly
            ? undefined
            : (newIsSelected) => {
                onInputChange?.(propertyPath, newIsSelected);
              }
        }
        aria-label={property.label}
        isDisabled={readOnly}
      />
    </div>
  );
};

export default BooleanInput;
