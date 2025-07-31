import { FC, useState, useEffect } from "react";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { handleEnterKeyPressedInInputField } from "../../../../../../utils/ui.ts";

const EditableNodeName: FC<{
  initialName: string;
  nodeLabel: string;
  onNameChange?: (newName: string) => void;
  readOnly?: boolean;
}> = ({ initialName, nodeLabel, onNameChange, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (name !== initialName) {
      setName(initialName);
    }
  }, [initialName]);

  const handleSave = () => {
    if (name.trim() !== initialName) {
      onNameChange?.(name.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing && !readOnly ? (
        <Input
          autoFocus
          value={name}
          maxLength={30}
          onValueChange={setName}
          onBlur={handleSave}
          onKeyDown={(e) => handleEnterKeyPressedInInputField(e, handleSave)}
          className="text-lg font-semibold text-gray-800 w-full"
          classNames={{
            inputWrapper:
              "focus-within:!outline-none focus-within:!ring-transparent focus-within:!ring-offset-0",
          }}
        />
      ) : (
        <h3 className="text-lg font-semibold text-gray-800">
          {initialName || nodeLabel}
        </h3>
      )}
      {!readOnly && (
        <Button
          isIconOnly
          size="sm"
          className="focus:outline-none hover:border-transparent bg-default-100 rounded-full text-foreground-500 hover:bg-default-200 focus-within:!outline-none focus-within:!ring-0"
          variant="light"
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Icon
            icon={isEditing ? "ic:round-check" : "ic:round-edit"}
            className="size-4"
          />
        </Button>
      )}
    </div>
  );
};

export default EditableNodeName;
