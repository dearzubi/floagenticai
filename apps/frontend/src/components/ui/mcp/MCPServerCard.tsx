import { MCPServerDescription } from "common";
import { FC } from "react";
import {
  Avatar,
  Card,
  CardBody,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { getIconUrl } from "../../../utils/misc.ts";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { MCPInstallationResponse } from "../../../apis/mcp/schemas.ts";
import { cardVariants } from "./animation.ts";
import { cn } from "../../../utils/ui.ts";

const MCPServerCard: FC<{
  server: MCPServerDescription;
  installation?: MCPInstallationResponse;
  isInstalled?: boolean;
  onInstall?: (server: MCPServerDescription) => void;
  onConfigure?: (installation: MCPInstallationResponse) => void;
  onUninstall?: (installation: MCPInstallationResponse) => void;
}> = ({
  server,
  installation,
  isInstalled = false,
  onInstall,
  onConfigure,
  onUninstall,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength).trim() + "...";
  };

  const displayTools = server.tools.slice(0, 3);
  const remainingToolsCount = server.tools.length - 3;

  return (
    <>
      <motion.div variants={cardVariants} layout>
        <Card
          className={cn(
            "h-full min-h-[280px] shadow-sm border border-default-300",
          )}
        >
          <CardBody className="p-4 flex flex-col h-full">
            <div className="flex gap-4 mb-4 items-center">
              <div className="flex-shrink-0">
                {server.icon ? (
                  <Avatar
                    src={getIconUrl(server.icon)}
                    alt={server.name}
                    className="w-12 h-12 bg-white"
                    radius="md"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="lucide:server"
                      className="w-6 h-6 text-primary"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {server.label}
                </h3>
                <Chip
                  size="sm"
                  variant="flat"
                  color="default"
                  className="mb-3 bg-default-100 text-default-500"
                >
                  {server.category}
                </Chip>
              </div>
              {isInstalled && typeof installation?.status === "string" && (
                <Chip
                  size="sm"
                  variant="bordered"
                  className={cn(
                    "mb-3",
                    installation?.status === "enabled"
                      ? "text-success-500 border border-success-400"
                      : "text-default-500 border border-default-400",
                  )}
                >
                  {installation?.status}
                </Chip>
              )}
            </div>

            <div className="flex-1 mb-4">
              <p className="text-default-600 text-sm">
                {truncateDescription(
                  installation?.description || server.description,
                )}
              </p>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {(isInstalled && installation?.selectedTools
                  ? installation.selectedTools.slice(0, 3)
                  : displayTools
                ).map((tool) => (
                  <Chip
                    key={tool}
                    size="sm"
                    variant="bordered"
                    color="default"
                    className="text-xs px-2"
                    startContent={
                      <Icon icon="lucide:wrench" className="w-3 h-3" />
                    }
                  >
                    {tool}
                  </Chip>
                ))}
                {(isInstalled && installation
                  ? Math.max(0, installation.selectedTools.length - 3)
                  : remainingToolsCount) > 0 && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    className="text-xs"
                  >
                    +
                    {isInstalled && installation
                      ? installation.selectedTools.length - 3
                      : remainingToolsCount}{" "}
                    more
                  </Chip>
                )}
              </div>

              <div className="flex gap-2">
                {isInstalled && installation ? (
                  <>
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      startContent={
                        <Icon icon="lucide:settings" className="w-4 h-4" />
                      }
                      onPress={() => onConfigure?.(installation)}
                      title="Configure"
                      className="flex-1 focus:outline-none hover:border-transparent "
                    >
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => onUninstall?.(installation)}
                      title="Uninstall"
                      className="flex-1 focus:outline-none hover:border-transparent"
                      startContent={
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      }
                    >
                      Uninstall
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      }
                      className="flex-1 bg-default-200 focus:outline-none hover:border-transparent"
                      onPress={onOpen}
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="solid"
                      startContent={
                        <Icon icon="lucide:download" className="w-4 h-4" />
                      }
                      onPress={() => onInstall?.(server)}
                      className="flex-1 focus:outline-none hover:border-transparent bg-primary-400 text-white"
                    >
                      Install
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          closeButton: "focus:outline-none hover:border-transparent",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  {server.icon ? (
                    <Avatar
                      src={getIconUrl(server.icon)}
                      alt={server.name}
                      className="w-16 h-16 bg-white"
                      radius="md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon
                        icon="lucide:server"
                        className="w-8 h-8 text-primary"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{server.label}</h2>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="default"
                      className="mb-3 bg-default-100 text-default-500"
                    >
                      {server.category}
                    </Chip>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-default-600">{server.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Available Tools ({server.tools.length})
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {server.tools.map((tool) => (
                        <Chip
                          key={tool}
                          size="md"
                          variant="bordered"
                          className="justify-start px-2"
                          startContent={
                            <Icon icon="lucide:wrench" className="w-4 h-4" />
                          }
                        >
                          {tool}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  color="default"
                  onPress={onClose}
                  className={"focus:outline-none hover:border-transparent"}
                >
                  Close
                </Button>
                <Button
                  variant="solid"
                  startContent={
                    <Icon icon="lucide:download" className="w-4 h-4" />
                  }
                  onPress={() => onInstall?.(server)}
                  className="focus:outline-none hover:border-transparent bg-primary-400 text-white"
                >
                  Install
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MCPServerCard;
