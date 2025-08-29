import { FC } from "react";
import { Select, SelectItem, Button, Chip } from "@heroui/react";

const MCPToolsInput: FC<{
  label: string;
  description?: string;
  tools: string[];
  selectedTools: string[];
  onSelectionChange: (selectedTools: string[]) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}> = ({
  label,
  description,
  tools,
  selectedTools,
  onSelectionChange,
  readOnly = false,
  isLoading = false,
  placeholder = "Select tools...",
}) => {
  const selectedKeys = new Set(selectedTools);
  const totalOptions = tools.length;
  const selectedCount = selectedKeys.size;
  const isAllSelected = selectedCount === totalOptions && totalOptions > 0;

  const handleSelectionChange = (keys: unknown) => {
    if (readOnly) {
      return;
    }
    const selectedValues = Array.from(keys as Set<string>);
    onSelectionChange(selectedValues);
  };

  const handleToggleAll = () => {
    if (readOnly) {
      return;
    }
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...tools]);
    }
  };

  const handleRemoveOption = (toolName: string) => {
    const updatedSelection = selectedTools.filter((tool) => tool !== toolName);
    onSelectionChange(updatedSelection);
  };

  const renderValue = (items: unknown) => {
    const selectedItems = items as { key: string; textValue: string }[];

    if (selectedItems.length === 0) {
      return <span className="text-default-500">{placeholder}</span>;
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
            {item.key}
          </Chip>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-600">{label}</span>
          {description && (
            <p className="text-xs text-default-500">{description}</p>
          )}
        </div>
        {!readOnly && totalOptions > 0 && (
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
        aria-label={label}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        className="w-full"
        isDisabled={readOnly || isLoading}
        renderValue={renderValue}
        classNames={{
          trigger:
            "focus:outline-none bg-default-100 hover:!bg-default-100 transition-colors border-none min-h-10 h-auto",
          value: "w-full",
        }}
      >
        {tools.map((tool) => (
          <SelectItem key={tool} textValue={tool}>
            {tool}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default MCPToolsInput;
