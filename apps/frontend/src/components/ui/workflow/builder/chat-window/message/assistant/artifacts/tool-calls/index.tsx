import { FC, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Chip,
  Code,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { getIconUrl } from "../../../../../../../../../utils/misc.ts";
import { AgentToolCallItem, safeParseJSON } from "common";

const ToolCallsArtifacts: FC<{
  agentToolCalls: AgentToolCallItem[];
}> = ({ agentToolCalls }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTool, setSelectedTool] = useState<AgentToolCallItem | null>(
    null,
  );
  const handleChipClick = (toolCall: AgentToolCallItem) => {
    setSelectedTool(toolCall);
    onOpen();
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-default-700 flex items-center gap-2">
        <Icon icon="carbon:tool-kit" className="w-4 h-4 text-primary" />
        Tool Calls
      </h4>
      <div className="flex flex-wrap gap-2">
        {agentToolCalls.map((toolCall, index) => (
          <Chip
            key={`${toolCall.toolName}-${index}`}
            size={"sm"}
            color="primary"
            className="cursor-pointer px-2 bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
            onClick={() => handleChipClick(toolCall)}
            startContent={
              toolCall.toolIcon ? (
                <img
                  src={getIconUrl(toolCall.toolIcon)}
                  alt={toolCall.toolName}
                  className="w-3 h-3 mr-1"
                />
              ) : (
                <Icon icon={"carbon:tool-kit"} className="w-3 h-3" />
              )
            }
          >
            {toolCall.toolName}
          </Chip>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {selectedTool?.toolIcon ? (
                    <img
                      src={getIconUrl(selectedTool.toolIcon)}
                      alt={selectedTool.toolName}
                      className="w-6 h-6"
                    />
                  ) : (
                    <Icon
                      icon={"carbon:tool-kit"}
                      className="w-5 h-5 text-primary"
                    />
                  )}
                  <span className="text-lg font-semibold">
                    {selectedTool?.toolName}
                  </span>
                </div>
              </ModalHeader>

              <ModalBody className="gap-4">
                {selectedTool && (
                  <>
                    <div>
                      <h4 className="text-medium font-semibold text-default-700 mb-2">
                        Tool Arguments
                      </h4>
                      <Code className="w-full p-3" color="default" radius="lg">
                        <pre className="whitespace-pre-wrap text-small">
                          {JSON.stringify(selectedTool.toolInput, null, 2)}
                        </pre>
                      </Code>
                    </div>

                    <Divider />

                    <div>
                      <h4 className="text-medium font-semibold text-default-700 mb-2">
                        Tool Output
                      </h4>
                      <div className="bg-default-100 rounded-lg p-3 overflow-hidden">
                        <p className="text-small text-default-800 whitespace-pre-wrap break-words">
                          {JSON.stringify(
                            safeParseJSON(
                              selectedTool?.toolOutput,
                              undefined,
                              selectedTool?.toolOutput,
                            ),
                            null,
                            2,
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  className="hover:border-transparent focus:outline-none"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ToolCallsArtifacts;
