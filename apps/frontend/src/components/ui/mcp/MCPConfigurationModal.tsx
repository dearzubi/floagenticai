import { FC, useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
  Avatar,
  Chip,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { MCPServerDescription } from "common";
import {
  MCPInstallationCreate,
  MCPInstallationUpdate,
  MCPInstallationResponse,
} from "../../../apis/mcp/schemas.ts";
import { getIconUrl } from "../../../utils/misc.ts";
import MCPToolsInput from "./MCPToolsInput.tsx";
import CredentialInput from "../workflow/builder/node/inputs/CredentialInput.tsx";

const MCPConfigurationModal: FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  server: MCPServerDescription;
  installation?: MCPInstallationResponse;
  onSubmit: (data: MCPInstallationCreate | MCPInstallationUpdate) => void;
  isLoading?: boolean;
}> = ({
  isOpen,
  onOpenChange,
  server,
  installation,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: installation?.name || `${server.label} Installation`,
    description: installation?.description || "",
    selectedTools: installation?.selectedTools || [],
    approvalRequiredTools: installation?.approvalRequiredTools || [],
    credentialId: installation?.credential?.id,
    status: installation?.status || ("enabled" as const),
  });

  const isInstalled = Boolean(installation);
  const isFormValid =
    formData.name.trim().length > 0 && formData.selectedTools.length > 0;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: installation?.name || `${server.label} Installation`,
        description: installation?.description || "",
        selectedTools: installation?.selectedTools || [],
        approvalRequiredTools: installation?.approvalRequiredTools || [],
        credentialId: installation?.credential?.id,
        status: installation?.status || "enabled",
      });
    }
  }, [isOpen, server, installation]);

  const handleSubmit = () => {
    const submitData = {
      name: formData.name,
      description: formData.description || undefined,
      selectedTools: formData.selectedTools,
      approvalRequiredTools: formData.approvalRequiredTools,
      credentialId: formData.credentialId,
      status: formData.status,
      ...(isInstalled ? {} : { mcpServerName: server.name }),
    };

    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        closeButton: "focus:outline-none hover:border-transparent",
      }}
      isDismissable={false}
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
                <div>
                  <h2 className="text-xl font-bold">
                    {isInstalled ? "Configure" : "Install"} {server.label}
                  </h2>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    className="bg-default-100 text-default-500"
                  >
                    {server.category}
                  </Chip>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-sm text-default-700">{server.description}</p>
                {/*<div className="p-4 bg-default-50 rounded-lg">*/}
                {/* */}
                {/*  /!*<div className="flex flex-wrap gap-2">*!/*/}
                {/*  /!*  <span className="text-xs font-medium text-default-600">*!/*/}
                {/*  /!*    Available Tools:*!/*/}
                {/*  /!*  </span>*!/*/}
                {/*  /!*  {server.tools.map((tool) => (*!/*/}
                {/*  /!*    <Chip*!/*/}
                {/*  /!*      key={tool}*!/*/}
                {/*  /!*      size="sm"*!/*/}
                {/*  /!*      variant="bordered"*!/*/}
                {/*  /!*      className="text-xs"*!/*/}
                {/*  /!*      startContent={*!/*/}
                {/*  /!*        <Icon icon="lucide:wrench" className="w-3 h-3" />*!/*/}
                {/*  /!*      }*!/*/}
                {/*  /!*    >*!/*/}
                {/*  /!*      {tool}*!/*/}
                {/*  /!*    </Chip>*!/*/}
                {/*  /!*  ))}*!/*/}
                {/*  /!*</div>*!/*/}
                {/*</div>*/}
              </div>
              <Divider />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <Input
                  label="Installation Name"
                  placeholder="Enter a name for this installation"
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  description="A unique name to identify this MCP server installation"
                  classNames={{
                    input: "focus:outline-none",
                  }}
                />

                <Textarea
                  label="Description"
                  placeholder="Optional description for this installation"
                  value={formData.description}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  rows={3}
                  classNames={{
                    input: "focus:outline-none",
                  }}
                />

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <p className="text-xs text-default-500">
                      Enable or disable this MCP server installation
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.status === "enabled"}
                    onValueChange={(enabled) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: enabled ? "enabled" : "disabled",
                      }))
                    }
                    color="primary"
                  >
                    {formData.status === "enabled" ? "Enabled" : "Disabled"}
                  </Switch>
                </div>
              </div>

              <Divider />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tool Configuration</h3>

                {formData.selectedTools.length === 0 && (
                  <p className="text-sm text-danger-500">
                    Please select at least one tool to{" "}
                    {isInstalled ? "configure" : "install"} the MCP server.
                  </p>
                )}

                <MCPToolsInput
                  tools={server.tools}
                  selectedTools={formData.selectedTools}
                  onSelectionChange={(tools) =>
                    setFormData((prev) => ({ ...prev, selectedTools: tools }))
                  }
                  label="Selected Tools"
                  description="Choose which tools you want to enable for this installation"
                  placeholder="Select tools to enable..."
                />

                {/* TODO: Implement later with human in the loop for MCP}
                {/*<MCPToolsInput*/}
                {/*  tools={formData.selectedTools}*/}
                {/*  selectedTools={formData.approvalRequiredTools}*/}
                {/*  onSelectionChange={(tools) =>*/}
                {/*    setFormData((prev) => ({*/}
                {/*      ...prev,*/}
                {/*      approvalRequiredTools: tools,*/}
                {/*    }))*/}
                {/*  }*/}
                {/*  label="Approval Required Tools"*/}
                {/*  description="Tools that require manual approval before execution"*/}
                {/*  placeholder="Select tools requiring approval..."*/}
                {/*/>*/}
              </div>

              <Divider />
              {typeof server.credential === "string" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Authentication</h3>
                  <CredentialInput
                    label="Credential"
                    description="Credential for authenticating with this MCP server"
                    credentialName={server.credential}
                    selectedCredentialId={formData.credentialId}
                    onCredentialChange={(credentialId) =>
                      setFormData((prev) => ({
                        ...prev,
                        credentialId: credentialId || undefined,
                      }))
                    }
                  />
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                variant="flat"
                onPress={onClose}
                isDisabled={isLoading}
                className={"focus:outline-none hover:border-transparent"}
              >
                Cancel
              </Button>
              <Button
                className={"focus:outline-none hover:border-transparent"}
                color="primary"
                onPress={handleSubmit}
                isDisabled={!isFormValid}
                isLoading={isLoading}
                startContent={
                  isLoading ? null : (
                    <Icon
                      icon={isInstalled ? "lucide:settings" : "lucide:download"}
                      className="w-4 h-4"
                    />
                  )
                }
              >
                {isInstalled ? "Update Configuration" : "Install Server"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MCPConfigurationModal;
