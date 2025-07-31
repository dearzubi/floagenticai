import { FC } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDeleteWorkflowVersion } from "../../../../hooks/workflow/api/workflow.api.hooks";

export const WorkflowVersionDeleteModal: FC<{
  workflowId: string;
  version: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}> = ({ workflowId, version, isOpen, onOpenChange, onSuccess }) => {
  const deleteVersionMutation = useDeleteWorkflowVersion();

  const handleDelete = async () => {
    try {
      await deleteVersionMutation.mutateAsync({
        workflowId,
        version,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete version:", error);
    }
  };

  const handleClose = () => {
    if (!deleteVersionMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      isDismissable={!deleteVersionMutation.isPending}
      hideCloseButton={deleteVersionMutation.isPending}
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
                <Icon icon="lucide:trash-2" className="w-5 h-5 text-danger" />
                <h2 className="text-xl font-semibold">Delete Version</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">Delete version</span>
                <Chip color="danger" variant="flat" size="sm">
                  {version}
                </Chip>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="lucide:trash-2"
                      className="w-5 h-5 text-danger mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-danger-800 mb-1">
                        Permanent Deletion
                      </p>
                      <ul className="text-danger-700 space-y-1">
                        <li>• This version will be permanently deleted</li>
                        <li>• This action cannot be undone</li>
                        <li>
                          • You will lose access to this version's workflow data
                        </li>
                        <li>
                          • Consider downloading a backup before proceeding
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {deleteVersionMutation.error && (
                  <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-sm text-danger-700">
                      Failed to delete version. Please try again.
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
                isDisabled={deleteVersionMutation.isPending}
                className="hover:border-transparent focus:outline-none"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleDelete}
                isLoading={deleteVersionMutation.isPending}
                spinner={<Spinner size="sm" color="current" />}
                className="hover:border-transparent focus:outline-none"
              >
                {deleteVersionMutation.isPending
                  ? "Deleting..."
                  : "Delete Version"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
