import { FC, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal.tsx";
import { WorkflowVersionHistoryModal } from "../../../version/WorkflowVersionHistoryModal.tsx";
import {
  useDeleteWorkflow,
  useExportWorkflow,
} from "../../../../../../hooks/workflow/api/workflow.api.hooks.ts";
import { useWorkflowData } from "../../../../../../hooks/workflow/workflow.data.hook.ts";
import { errorToast, successToast } from "../../../../../../utils/ui.ts";

const Menu: FC<{
  name: string;
  id?: string;
}> = ({ name, id }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deleteWorkflowMutation = useDeleteWorkflow();
  const exportWorkflowMutation = useExportWorkflow();
  const { currentWorkflow } = useWorkflowData();

  const {
    isOpen: isVersionHistoryOpen,
    onOpen: onVersionHistoryOpen,
    onOpenChange: onVersionHistoryOpenChange,
  } = useDisclosure();

  const handleExport = async () => {
    if (!id) {
      return;
    }

    try {
      const exportedData = await exportWorkflowMutation.mutateAsync(id);

      const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${exportedData.name.replace(/[^a-z0-9]/gi, "_")}_v${exportedData.currentVersion}_workflow_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      successToast("Workflow exported successfully!");
    } catch (error) {
      errorToast("Failed to export workflow");
      console.error("Export error:", error);
    }
  };

  return (
    <>
      {id && (
        <>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                className="rounded-md focus:outline-none text-default-700 hover:bg-default-100 active:bg-default-200"
                aria-label="Workflow settings"
              >
                <Icon
                  icon="material-symbols:settings-outline-rounded"
                  width="22"
                  height="22"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Workflow Actions">
              <DropdownItem
                key="workflow_settings"
                startContent={
                  <Icon icon="lucide:settings" width={16} height={16} />
                }
              >
                Workflow Settings
              </DropdownItem>
              <DropdownItem
                key="version_history"
                onPress={onVersionHistoryOpen}
                startContent={
                  <Icon icon="lucide:history" width={16} height={16} />
                }
              >
                Version History
              </DropdownItem>
              <DropdownItem
                key="export"
                onPress={handleExport}
                isDisabled={exportWorkflowMutation.isPending}
                startContent={
                  <Icon icon="lucide:download" width={16} height={16} />
                }
              >
                {exportWorkflowMutation.isPending
                  ? "Exporting..."
                  : "Export Workflow"}
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                onPress={() => setIsModalOpen(true)}
                startContent={
                  <Icon icon="lucide:trash-2" width={16} height={16} />
                }
              >
                Delete Workflow
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            isPending={deleteWorkflowMutation.isPending}
            workflowToDelete={name}
            confirmDeletion={() => deleteWorkflowMutation.mutate(id)}
          />

          {currentWorkflow && (
            <WorkflowVersionHistoryModal
              workflowId={id}
              isOpen={isVersionHistoryOpen}
              onOpenChange={onVersionHistoryOpenChange}
              currentVersion={currentWorkflow.currentVersion}
            />
          )}
        </>
      )}
    </>
  );
};

export default Menu;
