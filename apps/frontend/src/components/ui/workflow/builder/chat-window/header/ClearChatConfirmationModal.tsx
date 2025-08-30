import { FC } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button as HeroButton,
} from "@heroui/react";
import { Icon } from "@iconify/react";

const ClearChatConfirmationModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  confirmDeletion: () => void;
  isPending: boolean;
}> = ({ isOpen, onClose, confirmDeletion, isPending }) => {
  const title = "Clear Chat History";
  const message =
    "Are you sure you want to clear the chat history for this workflow?";

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
            This action cannot be undone. All messages will be permanently
            removed and memory of all agents will be cleared.
          </p>
        </ModalBody>
        <ModalFooter>
          <HeroButton
            variant="light"
            onPress={onClose}
            isDisabled={isPending}
            className="focus:outline-none hover:border-transparent"
          >
            Cancel
          </HeroButton>
          <HeroButton
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
            {isPending ? "Clearing..." : "Clear"}
          </HeroButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClearChatConfirmationModal;
