import { FC, PropsWithChildren, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { RegisteredRouter, useBlocker } from "@tanstack/react-router";

const NavigationBlocker: FC<
  PropsWithChildren<{
    blockCondition: boolean;
    handleOnCancel?: () => void;
    handleOnConfirm?: () => void;
    modalHeaderText?: string;
    modalBodyText?: string;
    confirmationButtonText?: string;
    cancelButtonText?: string;
  }>
> = ({
  children,
  blockCondition,
  handleOnCancel,
  handleOnConfirm,
  modalHeaderText,
  modalBodyText,
  confirmationButtonText,
  cancelButtonText,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { proceed, reset, status } = useBlocker<RegisteredRouter, true>({
    shouldBlockFn: () => blockCondition,
    withResolver: true,
  });

  const onConfirm = () => {
    handleOnConfirm?.();
    onClose();
    proceed?.();
  };

  const onCancel = () => {
    handleOnCancel?.();
    onClose();
    reset?.();
  };

  useEffect(() => {
    if (status === "blocked") {
      onOpen();
    } else {
      onClose();
    }
  }, [status, onOpen, onClose]);

  return (
    <>
      {children}
      <Modal isOpen={isOpen} onClose={onCancel}>
        <ModalContent>
          {(modalOnClose) => (
            <>
              <ModalHeader>{modalHeaderText ?? "Unsaved Changes"}</ModalHeader>
              <ModalBody>
                <p>
                  {modalBodyText ??
                    "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={modalOnClose}
                  className="focus:outline-none hover:border-transparent rounded-md"
                >
                  {cancelButtonText ?? "Stay on page"}
                </Button>
                <Button
                  color="danger"
                  onPress={onConfirm}
                  className="focus:outline-none hover:border-transparent rounded-md"
                >
                  {confirmationButtonText ?? "Discard changes and leave"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default NavigationBlocker;
