import { FC } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useWorkflowStore } from "../../../../../stores/workflow.store.ts";

const SaveButton: FC<{
  isSmallScreen: boolean;
  isPending: boolean;
  isFetching: boolean;
  handleSaveWorkflow: () => void;
}> = ({ isSmallScreen, isFetching, isPending, handleSaveWorkflow }) => {
  const workflowStore = useWorkflowStore();
  return (
    <Tooltip
      content={
        workflowStore.pendingChanges
          ? "Save Workflow (Unsaved changes)"
          : "Save Workflow"
      }
      showArrow={true}
      color={workflowStore.pendingChanges ? "warning" : "foreground"}
      closeDelay={100}
      placement="bottom"
      size={"sm"}
    >
      <Button
        isIconOnly={isSmallScreen}
        color={workflowStore.pendingChanges ? "warning" : "primary"}
        size="sm"
        className="rounded-md focus:outline-none font-medium border-none"
        aria-label="Save workflow"
        isLoading={isPending}
        isDisabled={isPending || isFetching || !workflowStore.pendingChanges}
        onPress={() => handleSaveWorkflow()}
        startContent={
          !isPending && (
            <Icon
              icon={
                workflowStore.pendingChanges
                  ? "material-symbols:save-outline"
                  : "material-symbols:save"
              }
              width="20"
              height="20"
            />
          )
        }
      >
        {!isSmallScreen ? "Save" : ""}
      </Button>
    </Tooltip>
  );
};

export default SaveButton;
