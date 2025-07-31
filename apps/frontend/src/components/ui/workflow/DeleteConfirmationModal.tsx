import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { FC } from "react";

const DeleteConfirmationModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  confirmDeletion: () => void;
  workflowToDelete: string | string[] | null;
  isPending: boolean;
}> = ({ isOpen, isPending, onClose, confirmDeletion, workflowToDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(modalOnClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirm Deletion
            </ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to delete{" "}
                {typeof workflowToDelete === "string"
                  ? `"${workflowToDelete}" workflow`
                  : `${(workflowToDelete as string[])?.length ?? 0} workflows`}
                ? This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                className="focus:outline-none hover:border-transparent rounded-md"
                variant="light"
                onPress={modalOnClose}
              >
                Cancel
              </Button>
              <Button
                className="focus:outline-none hover:border-transparent rounded-md"
                color="danger"
                onPress={confirmDeletion}
                isLoading={isPending}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;
