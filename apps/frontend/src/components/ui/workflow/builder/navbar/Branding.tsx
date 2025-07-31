import { FC } from "react";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { handleEnterKeyPressedInInputField } from "../../../../../utils/ui.ts";
import { useWorkflowStore } from "../../../../../stores/workflow.store.ts";

const Branding: FC<{
  workflowName: string;
  isEditingName: boolean;
  setIsEditingName: (isEditingName: boolean) => void;
  setWorkflowName: (workflowName: string) => void;
  isFetching: boolean;
  handleEditName: () => void;
}> = ({
  workflowName,
  isFetching,
  isEditingName,
  setIsEditingName,
  setWorkflowName,
  handleEditName,
}) => {
  const workflowStore = useWorkflowStore();
  return (
    <div className="flex items-center gap-4">
      {!isEditingName ? (
        <>
          <div className="flex items-center gap-1">
            {workflowStore.pendingChanges && (
              <span className="text-red-500 text-lg font-bold">*</span>
            )}
            <span className="font-semibold text-lg text-foreground truncate flex-1">
              {workflowName}
            </span>
          </div>
          {!isFetching && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="focus:outline-none hover:border-transparent min-w-8 w-8 h-8"
              onPress={() => setIsEditingName(true)}
              aria-label="Edit workflow name"
            >
              <Icon icon="lucide:pencil" width={16} />
            </Button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={workflowName}
            onValueChange={setWorkflowName}
            variant="bordered"
            size="sm"
            className="flex-1 max-w-xs"
            classNames={{
              input: "font-semibold text-lg",
              inputWrapper:
                "h-8 min-h-8 border-default-200 group-data-[hover=true]:border-default-300 group-data-[focus=true]:border-default-300",
            }}
            onKeyDown={(e) =>
              handleEnterKeyPressedInInputField(e, handleEditName)
            }
            onBlur={handleEditName}
            autoFocus
            placeholder="Enter workflow name"
          />
          <Button
            isIconOnly
            size="sm"
            color="success"
            variant="light"
            onPress={handleEditName}
            aria-label="Save name"
            className="min-w-8 w-8 h-8 border-none focus:outline-none"
          >
            <Icon icon="lucide:check" width={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Branding;
