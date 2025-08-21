import { FC, useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { NODE_SETTINGS } from "../constants.ts";
import Properties from "./Properties.tsx";
import { setNestedValue } from "../utils.ts";
import { useReactFlow } from "@xyflow/react";
import { useWorkflowStore } from "../../../../../../stores/workflow.store.ts";
import { useNodeVersionSelector } from "../../../../../../hooks/workflow/node.hooks.ts";
import { useWorkflowHistory } from "../../../../../../hooks/workflow/workflow.history.hook.ts";
import VersionSelector from "./VersionSelector.tsx";
import { WorkflowBuilderUINodeData } from "common";
import OutputShape from "./output-shape";
import EditableNodeName from "./EditableNodeName.tsx";
import { JSONSchemaDraft07 } from "common";
import UndoRedo from "../../UndoRedo.tsx";
import { cloneDeep } from "lodash";

const motionProps = {
  variants: {
    enter: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  },
} as const;

const ConfigurationModal: FC<{
  openConfigurationModal: boolean;
  setOpenConfigurationModal: (open: boolean) => void;
  nodeId: string;
  nodeData: WorkflowBuilderUINodeData;
}> = ({
  openConfigurationModal,
  setOpenConfigurationModal,
  nodeId,
  nodeData,
}) => {
  const { setNodes } = useReactFlow();

  const setPendingChanges = useWorkflowStore(
    (state) => state.setPendingChanges,
  );
  const currentWorkflow = useWorkflowStore((state) => state.currentWorkflow);
  const readOnly = useWorkflowStore((state) => state.readOnly);

  const { saveSnapshot } = useWorkflowHistory(currentWorkflow?.id);
  const outputShapeRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nodeSettings = NODE_SETTINGS[nodeData.name];

  const {
    versionListSorted,
    selectedVersion,
    selectedVersionNumber,
    setSelectedVersionNumber,
  } = useNodeVersionSelector({
    nodeVersions: nodeData?.versions || [],
    initialSelectedVersionNumber: nodeData.currentVersion,
    defaultVersionNumber: nodeData.defaultVersion,
  });

  const [inputs, setInputs] = useState(selectedVersion?.inputs || {});

  useEffect(() => {
    if (selectedVersion) {
      setInputs(selectedVersion.inputs || {});
    }
  }, [selectedVersion]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleVersionChange = (versionNumber: string) => {
    // Save snapshot before making changes
    const nodeName = nodeData.friendlyName || nodeData.label || nodeId;
    saveSnapshot(`Changed version of "${nodeName}" to v${versionNumber}`);

    setSelectedVersionNumber(versionNumber);

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const clonedNode = cloneDeep(node);
          return {
            ...clonedNode,
            data: {
              ...clonedNode.data,
              currentVersion: Number(versionNumber),
            } as WorkflowBuilderUINodeData,
          };
        }
        return node;
      }),
    );

    setPendingChanges(true);
  };

  const handleFriendlyNameChange = (newFriendlyName: string) => {
    // Save snapshot before making changes
    const oldName = nodeData.friendlyName || nodeData.label || nodeId;
    saveSnapshot(`Renamed "${oldName}" to "${newFriendlyName}"`);

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              friendlyName: newFriendlyName,
            } as WorkflowBuilderUINodeData,
          };
        }
        return node;
      }),
    );
    setPendingChanges(true);
  };

  const handleInputChange = (path: string, value: unknown) => {
    const nodeName = nodeData.friendlyName || nodeData.label || nodeId;
    const fieldName = path.split(".").pop() || path;
    saveSnapshot(`Updated "${fieldName}" in "${nodeName}"`);

    setInputs((prevInputs) => {
      const newInputs = cloneDeep(prevInputs);
      setNestedValue(newInputs, path, value);

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === nodeId) {
            const updatedVersions = (
              node.data as WorkflowBuilderUINodeData
            ).versions?.map((version) => {
              if (version.version === Number(selectedVersionNumber)) {
                return {
                  ...cloneDeep(version),
                  inputs: newInputs,
                };
              }
              return version;
            });

            const clonedNode = cloneDeep(node);

            return {
              ...clonedNode,
              data: {
                ...clonedNode.data,
                versions: updatedVersions,
              },
            };
          }
          return node;
        }),
      );

      return newInputs;
    });

    setPendingChanges(true);
  };

  const handleCredentialChange = (
    credentialName: string,
    credentialId: string | null,
  ) => {
    const nodeName = nodeData.friendlyName || nodeData.label || nodeId;
    saveSnapshot(`Updated ${credentialName} in "${nodeName}"`);

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedVersions = (
            node.data as WorkflowBuilderUINodeData
          ).versions?.map((version) => {
            if (version.version === Number(selectedVersionNumber)) {
              let newCredentials = [...(version.credentials || [])];

              if (typeof credentialId === "string") {
                // To prevent potential duplicates, first remove any existing credential with the same name
                newCredentials = newCredentials.filter(
                  (cred) => cred.name !== credentialName,
                );
                newCredentials.push({ name: credentialName, id: credentialId });
              } else {
                newCredentials = newCredentials.filter(
                  (cred) => cred.name !== credentialName,
                );
              }

              return {
                ...cloneDeep(version),
                credentials: cloneDeep(newCredentials),
              };
            }
            return version;
          });

          const clonedNode = cloneDeep(node);

          return {
            ...clonedNode,
            data: {
              ...clonedNode.data,
              versions: updatedVersions,
            },
          };
        }
        return node;
      }),
    );
    setPendingChanges(true);
  };

  const handleScrollToOutput = () => {
    outputShapeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const userDefinedOutputStructureSchema = (inputs as Record<string, unknown>)
    ?.output_structure as JSONSchemaDraft07 | undefined;

  return (
    <Modal
      isOpen={openConfigurationModal}
      onOpenChange={() => setOpenConfigurationModal(false)}
      motionProps={motionProps}
      size="3xl"
      classNames={{
        base: "h-[90vh]",
        closeButton: "hidden",
      }}
      scrollBehavior="inside"
      isDismissable={false}
    >
      <ModalContent className="py-4">
        {() => (
          <>
            <ModalHeader className="flex items-start justify-end gap-4">
              <div className="flex items-start gap-4 w-full">
                {nodeSettings && nodeData && (
                  <>
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${nodeSettings.color}15`,
                        border: `1px solid ${nodeSettings.color}30`,
                      }}
                    >
                      <Icon
                        icon={nodeSettings.icon}
                        className="h-7 w-7"
                        style={{ color: nodeSettings.color }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <EditableNodeName
                        initialName={nodeData.friendlyName || ""}
                        nodeLabel={nodeData.label}
                        onNameChange={
                          readOnly ? undefined : handleFriendlyNameChange
                        }
                        readOnly={readOnly}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {nodeData.description || "Manage node configuration."}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-start">
                {selectedVersion?.outputsShape && (
                  <Button
                    variant="light"
                    onPress={handleScrollToOutput}
                    className="focus:outline-none hover:border-transparent bg-default-100 rounded-full text-foreground-500 hover:bg-default-200"
                    size="sm"
                  >
                    Outputs
                  </Button>
                )}
                <VersionSelector
                  selectedVersionNumber={selectedVersionNumber}
                  setSelectedVersionNumber={
                    readOnly ? undefined : handleVersionChange
                  }
                  versionListSorted={versionListSorted}
                  readOnly={readOnly}
                />
                <Button
                  isIconOnly={true}
                  className="rounded-full bg-default-100 text-foreground-500 border-none p-0 w-fit outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 hover:outline-none hover:ring-0 active:outline-none active:ring-0 hover:bg-default-200"
                  variant="light"
                  size="sm"
                  onPress={() => setOpenConfigurationModal(false)}
                >
                  <Icon icon="ic:baseline-clear" className={"size-4"} />
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="border-t pt-6">
                <div className="flex flex-col gap-4">
                  {selectedVersion && (
                    <Properties
                      inputs={inputs}
                      properties={selectedVersion.properties}
                      onInputChange={handleInputChange}
                      selectedVersion={selectedVersion}
                      nodeName={nodeData.name}
                      onCredentialChange={handleCredentialChange}
                      readOnly={readOnly}
                    />
                  )}
                  {selectedVersion?.outputsShape && (
                    <div ref={outputShapeRef}>
                      <OutputShape
                        nodeOutputSchema={selectedVersion?.outputsShape}
                        userDefinedOutputStructureSchema={
                          userDefinedOutputStructureSchema
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex w-full justify-between">
                <div className={"flex gap-2"}>
                  {currentWorkflow?.id && !readOnly && (
                    <UndoRedo workflowId={currentWorkflow?.id} />
                  )}
                </div>
                <Button
                  className="rounded-lg bg-default-100 text-foreground-500 border-none p-0 w-fit outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 hover:outline-none hover:ring-0 active:outline-none active:ring-0 hover:bg-default-200"
                  variant="light"
                  size="lg"
                  onPress={() => setOpenConfigurationModal(false)}
                >
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfigurationModal;
