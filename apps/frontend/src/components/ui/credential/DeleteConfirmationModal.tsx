import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmDeletion: () => void;
  credentialToDelete: string | string[] | null;
  isPending: boolean;
}

const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  confirmDeletion,
  credentialToDelete,
  isPending,
}) => {
  const isMultiple = Array.isArray(credentialToDelete);
  const title = isMultiple ? "Delete Credentials" : "Delete Credential";
  const message = isMultiple
    ? `Are you sure you want to delete ${credentialToDelete.length} credentials?`
    : `Are you sure you want to delete "${credentialToDelete}"?`;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      classNames={{
        base: "bg-background",
        backdrop: "bg-overlay/50 backdrop-opacity-disabled",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-1 items-center text-danger">
          <Icon icon="lucide:alert-triangle" width={20} height={20} />
          {title}
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600">{message}</p>
          <p className="text-sm text-default-500">
            This action cannot be undone. All associated data will be
            permanently removed.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isPending}
            className="focus:outline-none hover:border-transparent"
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={confirmDeletion}
            isLoading={isPending}
            isDisabled={isPending}
            className="focus:outline-none hover:border-transparent"
            startContent={
              !isPending && (
                <Icon icon="lucide:trash-2" width={16} height={16} />
              )
            }
          >
            {isPending ? "Deleting..." : isMultiple ? "Delete All" : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;
