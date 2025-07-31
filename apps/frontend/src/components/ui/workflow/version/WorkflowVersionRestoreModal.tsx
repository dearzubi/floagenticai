import { useState, FC } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Chip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRestoreWorkflowVersion } from "../../../../hooks/workflow/api/workflow.api.hooks";

export const WorkflowVersionRestoreModal: FC<{
  workflowId: string;
  version: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}> = ({ workflowId, version, isOpen, onOpenChange, onSuccess }) => {
  const [description, setDescription] = useState("");

  const restoreVersionMutation = useRestoreWorkflowVersion();

  const handleRestore = async () => {
    try {
      await restoreVersionMutation.mutateAsync({
        workflowId,
        version,
        description: description.trim() || undefined,
      });
      setDescription("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to restore version:", error);
    }
  };

  const handleClose = () => {
    if (!restoreVersionMutation.isPending) {
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      isDismissable={!restoreVersionMutation.isPending}
      hideCloseButton={restoreVersionMutation.isPending}
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        closeButton: "hover:border-transparent focus:outline-none",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon
                  icon="lucide:alert-triangle"
                  className="w-5 h-5 text-warning"
                />
                <h2 className="text-xl font-semibold">Restore Version</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">
                  Restore to version
                </span>
                <Chip color="primary" variant="flat" size="sm">
                  {version}
                </Chip>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="lucide:alert-triangle"
                      className="w-5 h-5 text-warning mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-warning-800 mb-1">
                        Important Notice
                      </p>
                      <ul className="text-warning-700 space-y-1">
                        <li>
                          • Your current workflow will be backed up
                          automatically
                        </li>
                        <li>
                          • The selected version will become the current version
                        </li>
                        <li>• This action cannot be undone directly</li>
                        <li>
                          • You can restore from the backup later if needed
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Textarea
                    label="Backup Description (Optional)"
                    placeholder="Enter a description for the backup of your current version..."
                    value={description}
                    onValueChange={setDescription}
                    minRows={3}
                    maxRows={5}
                    description="This will help you identify the backup version later"
                    isDisabled={restoreVersionMutation.isPending}
                  />
                </div>

                {restoreVersionMutation.error && (
                  <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-sm text-danger-700">
                      Failed to restore version. Please try again.
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="flat"
                onPress={handleClose}
                isDisabled={restoreVersionMutation.isPending}
                className="hover:border-transparent focus:outline-none"
              >
                Cancel
              </Button>
              <Button
                color="warning"
                onPress={handleRestore}
                isLoading={restoreVersionMutation.isPending}
                spinner={<Spinner size="sm" color="current" />}
                className="hover:border-transparent focus:outline-none"
              >
                {restoreVersionMutation.isPending
                  ? "Restoring..."
                  : "Restore Version"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
