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
import { MCPInstallationResponse } from "../../../apis/mcp/schemas";

const UninstallConfirmationModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  confirmUninstall: () => void;
  installation: MCPInstallationResponse | null;
  isPending: boolean;
}> = ({ isOpen, onClose, confirmUninstall, installation, isPending }) => {
  if (!installation) {
    return null;
  }

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
          Uninstall MCP Server
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600">
            Are you sure you want to uninstall "{installation.name}"?
          </p>
          <p className="text-sm text-default-500">
            This action cannot be undone. The server configuration and all
            associated settings will be permanently removed.
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
            onPress={confirmUninstall}
            isLoading={isPending}
            isDisabled={isPending}
            className="focus:outline-none hover:border-transparent"
            startContent={
              !isPending && (
                <Icon icon="lucide:server-off" width={16} height={16} />
              )
            }
          >
            {isPending ? "Uninstalling..." : "Uninstall"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UninstallConfirmationModal;
