import { FC } from "react";
import { Select, SelectItem, Button, Chip } from "@heroui/react";
import { INodeProperty } from "common";
import { get } from "lodash";
import Label from "./Label.tsx";

const MultiOptionsInput: FC<{
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
  const currentValue = get(inputs, propertyPath) as string[] | undefined;
  const selectedKeys = new Set(currentValue || []);
  const totalOptions = property.options?.length || 0;
  const selectedCount = selectedKeys.size;
  const isAllSelected = selectedCount === totalOptions && totalOptions > 0;

  const handleSelectionChange = (keys: unknown) => {
    if (readOnly) {
      return;
    }
    const selectedValues = Array.from(keys as Set<string>);
    onInputChange?.(propertyPath, selectedValues);
  };

  const handleToggleAll = () => {
    if (readOnly) {
      return;
    }
    if (isAllSelected) {
      onInputChange?.(propertyPath, []);
    } else {
      const allOptionValues =
        property.options?.map((option) => option.name) || [];
      onInputChange?.(propertyPath, allOptionValues);
    }
  };

  const handleRemoveOption = (optionName: string) => {
    const updatedSelection = (currentValue || []).filter(
      (value) => value !== optionName,
    );
    onInputChange?.(propertyPath, updatedSelection);
  };

  const getOptionLabel = (optionName: string): string => {
    const option = property.options?.find((opt) => opt.name === optionName);
    return option?.label || optionName;
  };

  const renderValue = (items: unknown) => {
    const selectedItems = items as { key: string; textValue: string }[];

    if (selectedItems.length === 0) {
      return (
        <span className="text-default-500">{`Select ${property.label}`}</span>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 max-w-full">
        {selectedItems.map((item) => (
          <Chip
            key={item.key}
            size="sm"
            variant="flat"
            onClose={() => {
              handleRemoveOption(item.key);
            }}
            classNames={{
              base: "bg-primary-100 text-primary-900 max-w-32",
              content: "truncate",
              closeButton: "text-primary-500 hover:text-primary-700",
            }}
          >
            {getOptionLabel(item.key)}
          </Chip>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label property={property} />
        {!readOnly && (
          <Button
            size="sm"
            variant="flat"
            onPress={handleToggleAll}
            className="hover:border-transparent focus:outline-none"
          >
            {isAllSelected ? "Clear All" : "Select All"}
          </Button>
        )}
      </div>
      <Select
        aria-label={property.label}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        className="w-full"
        isRequired={!property.optional}
        isDisabled={readOnly || isLoading}
        renderValue={renderValue}
        classNames={{
          trigger:
            "focus:outline-none bg-default-100 hover:!bg-default-100 transition-colors border-none min-h-10 h-auto",
          value: "w-full",
        }}
      >
        {property.options?.map((option) => (
          <SelectItem
            key={option.name}
            textValue={option.label}
            description={option.description}
          >
            {option.label}
          </SelectItem>
        )) || []}
      </Select>
    </div>
  );
};

export default MultiOptionsInput;
