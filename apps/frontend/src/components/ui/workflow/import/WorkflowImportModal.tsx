import { FC, useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useImportWorkflow } from "../../../../hooks/workflow/api/workflow.api.hooks.ts";
import { useRouter } from "@tanstack/react-router";
import { errorToast, successToast } from "../../../../utils/ui.ts";

interface ParsedWorkflowData {
  name: string;
  exportedAt?: string;
  currentVersion?: string;
}

export const WorkflowImportModal: FC<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowData, setWorkflowData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [parsedData, setParsedData] = useState<ParsedWorkflowData | null>(null);
  const [customName, setCustomName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importWorkflowMutation = useImportWorkflow();
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/json") {
      errorToast("Please select a JSON file");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (!jsonData.name || !jsonData.serialisedReactFlow) {
          errorToast("Invalid workflow file format");
          return;
        }

        setWorkflowData(jsonData);
        setParsedData({
          name: jsonData.name,
          exportedAt: jsonData.exportedAt,
          currentVersion: jsonData.currentVersion,
        });
        setCustomName(jsonData.name);
      } catch (error) {
        errorToast("Failed to parse JSON file");
        console.error("Parse error:", error);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!workflowData) {
      errorToast("No workflow data to import");
      return;
    }

    try {
      const result = await importWorkflowMutation.mutateAsync({
        workflowData,
        name: customName.trim() || undefined,
      });

      successToast("Workflow imported successfully!");
      onOpenChange(false);

      router.navigate({
        to: "/builder/$workflowId",
        params: { workflowId: result.id },
      });
    } catch (error) {
      errorToast("Failed to import workflow");
      console.error("Import error:", error);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setWorkflowData(null);
    setParsedData(null);
    setCustomName("");
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:upload" width={20} height={20} />
                Import Workflow
              </div>
              <p className="text-sm text-default-500 font-normal">
                Import a workflow from a JSON export file
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : workflowData
                        ? "border-success bg-success/5"
                        : "border-default-300 hover:border-default-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {workflowData ? (
                    <div className="flex flex-col items-center gap-2">
                      <Icon
                        icon="lucide:check-circle"
                        width={32}
                        height={32}
                        className="text-success"
                      />
                      <p className="text-success font-medium">
                        File loaded successfully
                      </p>
                      <p className="text-sm text-default-500">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Icon
                        icon="lucide:upload-cloud"
                        width={32}
                        height={32}
                        className="text-default-400"
                      />
                      <p className="font-medium">
                        Drop your workflow JSON file here
                      </p>
                      <p className="text-sm text-default-500">
                        or click to browse
                      </p>
                    </div>
                  )}
                </div>

                {parsedData && (
                  <Card>
                    <CardBody className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:file-text" width={16} height={16} />
                        <span className="font-medium">Workflow Details</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-default-500">
                            Original Name:
                          </span>
                          <p className="font-medium">{parsedData.name}</p>
                        </div>

                        {parsedData.currentVersion && (
                          <div>
                            <span className="text-default-500">Version:</span>
                            <p className="font-medium">
                              {parsedData.currentVersion}
                            </p>
                          </div>
                        )}

                        {parsedData.exportedAt && (
                          <div>
                            <span className="text-default-500">Exported:</span>
                            <p className="font-medium">
                              {new Date(
                                parsedData.exportedAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {workflowData && (
                  <Input
                    label="Workflow Name"
                    placeholder="Enter a name for the imported workflow"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    description="Leave empty to use the original name"
                    startContent={
                      <Icon icon="lucide:edit-3" width={16} height={16} />
                    }
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="flat"
                onPress={onClose}
                className={"hover:border-transparent focus:outline-none"}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleImport}
                isDisabled={!workflowData || importWorkflowMutation.isPending}
                isLoading={importWorkflowMutation.isPending}
                startContent={
                  !importWorkflowMutation.isPending && (
                    <Icon icon="lucide:upload" width={16} height={16} />
                  )
                }
                className={"hover:border-transparent focus:outline-none"}
              >
                {importWorkflowMutation.isPending
                  ? "Importing..."
                  : "Import Workflow"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
