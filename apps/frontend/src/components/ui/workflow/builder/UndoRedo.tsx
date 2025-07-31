import { FC } from "react";
import { useWorkflowHistory } from "../../../../hooks/workflow/workflow.history.hook.ts";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

const UndoRedo: FC<{
  workflowId: string;
}> = ({ workflowId }) => {
  const { undo, redo, canUndo, canRedo } = useWorkflowHistory(workflowId);

  return (
    <>
      <Tooltip content={"Undo"} placement="top" closeDelay={200}>
        <Button
          isIconOnly
          color="default"
          variant="flat"
          className="rounded-full shadow border border-default-400 transition-transform hover:scale-110 focus:outline-none hover:border-default-400 bg-white"
          onPress={undo}
          isDisabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Icon icon="lucide:undo" className="h-5 w-5" />
        </Button>
      </Tooltip>
      <Tooltip content={"Redo"} placement="top" closeDelay={200}>
        <Button
          isIconOnly
          color="default"
          variant="flat"
          className="rounded-full shadow border border-default-400 transition-transform hover:scale-110 focus:outline-none hover:border-default-400 bg-white"
          onPress={redo}
          isDisabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Icon icon="lucide:redo" className="h-5 w-5" />
        </Button>
      </Tooltip>
    </>
  );
};

export default UndoRedo;
