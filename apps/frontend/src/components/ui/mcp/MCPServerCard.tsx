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
            "h-full min-h-[280px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-gray-200/60 dark:border-gray-600/70 shadow-lg transition-all duration-300 ring-2 ring-gray-300/30 dark:ring-gray-600/40",
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
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-300/30 shadow-lg">
                    <Icon
                      icon="lucide:server"
                      className="w-6 h-6 text-indigo-600"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate text-gray-800 dark:text-gray-200">
                  {server.label}
                </h3>
                <Chip
                  size="sm"
                  variant="flat"
                  className="mb-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                      ? "text-emerald-600 border border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                      : "text-gray-600 border border-gray-400 bg-gray-50/50 dark:bg-gray-800/50",
                  )}
                >
                  {installation?.status}
                </Chip>
              )}
            </div>

            <div className="flex-1 mb-4">
              <p className="text-default-700 dark:text-default-300 text-sm leading-relaxed">
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
                    className="text-xs px-1 bg-default-50 border border-default-300/30 text-default-800 dark:text-blue-300"
                    startContent={
                      <Icon
                        icon="lucide:wrench"
                        className="w-3 h-3 text-default-800"
                      />
                    }
                  >
                    <span className={"px-1"}>{tool}</span>
                  </Chip>
                ))}
                {(isInstalled && installation
                  ? Math.max(0, installation.selectedTools.length - 3)
                  : remainingToolsCount) > 0 && (
                  <Chip
                    size="sm"
                    variant="flat"
                    className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300"
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
                      startContent={
                        <Icon icon="lucide:settings" className="w-4 h-4" />
                      }
                      onPress={() => onConfigure?.(installation)}
                      title="Configure"
                      className="flex-1 focus:outline-none bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-300/30 hover:border-indigo-400/50 text-indigo-700 dark:text-indigo-300 transition-all duration-300"
                    >
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => onUninstall?.(installation)}
                      title="Uninstall"
                      className="flex-1 focus:outline-none bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300 transition-all duration-300"
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
                      className="flex-1 focus:outline-none bg-gradient-to-r from-gray-500/10 to-slate-500/10 hover:from-gray-500/20 hover:to-slate-500/20 border border-gray-300/30 hover:border-gray-400/50 text-gray-700 dark:text-gray-300 transition-all duration-300"
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
                      className="flex-1 focus:outline-none hover:border-transparent bg-indigo-500 hover:from-indigo-500/90 hover:to-purple-500/90 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
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
