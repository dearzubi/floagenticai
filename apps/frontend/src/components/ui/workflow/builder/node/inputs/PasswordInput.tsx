import { FC, useEffect, useState } from "react";
import { INodeProperty } from "common";
import { Input } from "@heroui/react";
import { getPropertyInputValue } from "../utils.ts";
import Label from "./Label.tsx";
import { Icon } from "@iconify/react";

const PasswordInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
}> = ({ property, inputs, propertyPath, onInputChange, readOnly = false }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

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
        type={isPasswordVisible ? "text" : "password"}
        isReadOnly={readOnly}
        classNames={{
          clearButton:
            "!bg-transparent !text-gray-500 hover:!text-gray-700 border-none focus:outline-none transition-colors",
          innerWrapper:
            "focus-within:!outline-none focus-within:!ring-transparent focus-within:!ring-offset-0",
          input: "focus:outline-none focus:ring-0 focus:ring-offset-0",
        }}
        endContent={
          <button
            className="focus:outline-none hover:border-transparent"
            type="button"
            onClick={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <Icon
                icon="lucide:eye-off"
                className="pointer-events-none text-default-400"
              />
            ) : (
              <Icon
                icon="lucide:eye"
                className="pointer-events-none text-default-400"
              />
            )}
          </button>
        }
      />
    </div>
  );
};

export default PasswordInput;
