import { FC } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { ReactFlowProvider } from "@xyflow/react";
import { useGetWorkflowVersion } from "../../../../hooks/workflow/api/workflow.api.hooks";
import WorkflowCanvas from "../builder/WorkflowCanvas";

export const WorkflowVersionPreviewModal: FC<{
  workflowId: string;
  version: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}> = ({ workflowId, version, isOpen, onOpenChange }) => {
  const {
    data: versionData,
    isLoading,
    error,
  } = useGetWorkflowVersion(workflowId, version, isOpen);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      hideCloseButton
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        wrapper: "p-0",
        base: "m-0 max-w-none w-full h-[90vh]",
        body: "p-0",
        header: "px-6 py-4 border-b border-divider",
        footer: "px-6 py-4 border-t border-divider",
        closeButton: "hover:border-transparent focus:outline-none",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Preview Version</h2>
                <Chip color="primary" variant="flat" size="sm">
                  Version {version}
                </Chip>
                {versionData && (
                  <span className="text-sm text-default-500">
                    {versionData.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Chip color="warning" variant="flat" size="sm">
                  Read-only
                </Chip>
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  className="hover:border-transparent focus:outline-none"
                >
                  Close Preview
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner size="lg" />
                  <span className="ml-2">Loading version...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-danger">
                  <p>Failed to load version. Please try again.</p>
                </div>
              ) : versionData ? (
                <div className="h-full relative">
                  <ReactFlowProvider>
                    <WorkflowCanvas
                      initialData={versionData.serialisedReactFlow}
                      readOnly={true}
                    />
                  </ReactFlowProvider>
                </div>
              ) : null}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
