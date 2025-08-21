import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { FC, useEffect, useRef } from "react";
import { INodeProperty } from "common";
import { getIconUrl } from "../../../../../../utils/misc.ts";
import { getPropertyInputValue } from "../utils.ts";
import Label from "./Label.tsx";

const OptionsInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
  isLoading?: boolean;
}> = ({
  property,
  inputs,
  propertyPath,
  onInputChange,
  readOnly = false,
  isLoading,
}) => {
  const initialValue = getPropertyInputValue(
    inputs,
    propertyPath,
    typeof property.default !== "boolean" ? property.default : null,
  );

  const selectedOptionIcon = property.options?.find(
    (option) => option.name === initialValue,
  )?.icon;

  const hasSetInitialValue = useRef(false);

  useEffect(() => {
    if (
      !hasSetInitialValue.current &&
      property.default !== undefined &&
      property.default !== null &&
      typeof property.default !== "boolean"
    ) {
      const currentPropertyInput = getPropertyInputValue(
        inputs,
        propertyPath,
        null,
      );

      if (
        (currentPropertyInput === null || currentPropertyInput === undefined) &&
        initialValue !== null &&
        initialValue !== undefined
      ) {
        onInputChange?.(propertyPath, initialValue);
        hasSetInitialValue.current = true;
      }
    }
  }, [propertyPath, property.default, onInputChange]);

  return (
    <div className="flex flex-col gap-2">
      <Label property={property} />
      <Autocomplete
        isLoading={isLoading}
        selectedKey={initialValue as string}
        aria-label={property.label}
        isDisabled={readOnly || isLoading}
        startContent={
          selectedOptionIcon ? (
            <img
              className="w-6 h-6"
              alt={String(initialValue ?? "")}
              src={getIconUrl(selectedOptionIcon)}
            />
          ) : null
        }
        onSelectionChange={
          readOnly
            ? undefined
            : (key) => {
                if (key !== initialValue) {
                  onInputChange?.(propertyPath, key);
                }
              }
        }
        classNames={{
          clearButton: "focus:!outline-none hover:border-transparent",
          selectorButton: "focus:!outline-none hover:border-transparent",
        }}
        inputProps={{
          classNames: {
            inputWrapper:
              "focus-within:!outline-none focus-within:!ring-transparent focus-within:!ring-offset-0 ",
            input: "focus:!outline-none focus:ring-0 focus:ring-offset-0",
          },
        }}
      >
        {property.options
          ? property.options.map((option) => {
              return (
                <AutocompleteItem
                  key={option.name}
                  startContent={
                    option.icon ? (
                      <img
                        className="w-6 h-6"
                        alt={option.name}
                        src={getIconUrl(option.icon)}
                      />
                    ) : null
                  }
                >
                  {option.label}
                </AutocompleteItem>
              );
            })
          : null}
      </Autocomplete>
    </div>
  );
};

export default OptionsInput;
