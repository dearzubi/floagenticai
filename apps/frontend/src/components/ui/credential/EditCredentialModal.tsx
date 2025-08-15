import { FC, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Avatar,
} from "@heroui/react";
import Properties from "../workflow/builder/node/generic/Properties.tsx";
import {
  useUpdateCredential,
  useCredentialDefinitionList,
  useGetCredential,
} from "../../../hooks/credential/api/credential.api.hooks.ts";
import { getIconUrl } from "../../../utils/misc.ts";
import StringInput from "../workflow/builder/node/inputs/StringInput.tsx";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

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

const EditCredentialModal: FC<{
  credentialId: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ credentialId, isOpen, onClose }) => {
  const { data: credential, isLoading: isLoadingCredential } = useGetCredential(
    credentialId,
    isOpen,
  );
  const { data: credentialDefinitions } = useCredentialDefinitionList();
  const { mutateAsync: updateCredential, isPending: isUpdating } =
    useUpdateCredential();

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [name, setName] = useState("");

  const credentialDefinition = Array.isArray(credentialDefinitions)
    ? credentialDefinitions.find(
        (definition) => definition.name === credential?.credentialName,
      )
    : undefined;

  useEffect(() => {
    if (isOpen && credentialId) {
      setName("");
      setInputs({});
    }
  }, [isOpen, credentialId]);

  useEffect(() => {
    if (credential && isOpen) {
      setName(credential.name || "");
      setInputs(credential.data || {});
    }
  }, [credential, isOpen]);

  const isSaveDisabled = () => {
    return (
      isUpdating || !name || !name.trim() || Object.keys(inputs).length === 0
    );
  };

  const handleUpdateCredential = async () => {
    if (!credential) {
      return;
    }

    await updateCredential({
      id: credential.id,
      data: {
        name: name.trim(),
        data: inputs,
      },
    });
    onClose();
  };

  const handleClose = () => {
    setName("");
    setInputs({});
    onClose();
  };

  if (isLoadingCredential) {
    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={handleClose}
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
          <ModalBody>
            <div className="flex items-center justify-center h-64">
              <Spinner label="Loading credential..." />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!credential || !credentialDefinition) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleClose}
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
        <ModalHeader className="flex items-start justify-end gap-4">
          <div className="flex items-start gap-4 w-full">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Credential
              </h3>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="border-t pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-default-50 rounded-lg border">
                {credentialDefinition.icon ? (
                  <Avatar
                    src={getIconUrl(credentialDefinition.icon)}
                    alt={credentialDefinition.label}
                    size="sm"
                    className="w-8 h-8"
                    classNames={{
                      base: "bg-transparent",
                      img: "object-contain",
                    }}
                  />
                ) : (
                  <Avatar
                    size="sm"
                    className="w-8 h-8 bg-default-100"
                    fallback={
                      <Icon
                        icon="lucide:key-round"
                        className="text-default-400"
                        width={20}
                        height={20}
                      />
                    }
                  />
                )}
                <div>
                  <div className="font-medium text-default-900">
                    {credentialDefinition.label}
                  </div>
                </div>
              </div>

              <StringInput
                property={{
                  label: "Name",
                  name: "name",
                  type: "string",
                  description:
                    "A descriptive name to help you identify this credential.",
                }}
                propertyPath="name"
                inputs={{ name }}
                onInputChange={(_path, value) => {
                  setName(value as string);
                }}
              />

              {credentialDefinition.properties && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-medium text-default-700">
                      Credential Details
                    </h4>
                    <p className="text-xs text-default-500">
                      For security, credential values display as
                      "FA_REDACTED_CREDENTIAL". Enter new values only for fields
                      you want to update. Fields left as
                      "FA_REDACTED_CREDENTIAL" will preserve their original
                      values.
                    </p>
                  </div>
                  <Properties
                    inputs={inputs}
                    properties={credentialDefinition.properties}
                    onInputChange={(path, value) => {
                      setInputs((prevState) => ({
                        ...prevState,
                        [path]: value as string,
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="rounded-lg bg-default-200 text-foreground-500 border-none p-0 w-fit outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 hover:outline-none hover:ring-0 active:outline-none active:ring-0 hover:bg-default-200"
            variant="light"
            size="lg"
            onPress={handleClose}
            isDisabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            className="rounded-lg hover:border-transparent focus:outline-none"
            color="primary"
            size="lg"
            isLoading={isUpdating}
            isDisabled={isSaveDisabled()}
            onPress={handleUpdateCredential}
            startContent={
              !isUpdating && <Icon icon="lucide:save" width={16} height={16} />
            }
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditCredentialModal;
