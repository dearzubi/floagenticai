import { FC, useEffect, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Properties from "../workflow/builder/node/generic/Properties.tsx";
import {
  useCreateCredential,
  useCredentialDefinitionList,
} from "../../../hooks/credential/api/credential.api.hooks.ts";
import { getIconUrl } from "../../../utils/misc.ts";
import { INodeCredential } from "common";
import StringInput from "../workflow/builder/node/inputs/StringInput.tsx";
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
};

const NewCredentialModal: FC<{
  openNewCredentialModal: boolean;
  setOpenNewCredentialModal: (open: boolean) => void;
}> = ({ openNewCredentialModal, setOpenNewCredentialModal }) => {
  const {
    data: credentialDefinitions,
    isLoading: isLoadingCredentialDefinitions,
  } = useCredentialDefinitionList();

  const { mutateAsync, isPending: isCreating } = useCreateCredential();

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [name, setName] = useState("");

  const [selectedCredentialDefinition, setSelectedCredentialDefinition] =
    useState<INodeCredential | null>(null);

  const selectedCredentialDefinitionIcon = Array.isArray(credentialDefinitions)
    ? credentialDefinitions.find(
        (definition) => definition.name === selectedCredentialDefinition?.name,
      )?.icon
    : undefined;

  useEffect(() => {
    if (
      Array.isArray(credentialDefinitions) &&
      credentialDefinitions.length > 0
    ) {
      setSelectedCredentialDefinition(credentialDefinitions[0]);
    }
  }, [credentialDefinitions]);

  const isSaveDisabled = () => {
    if (
      isCreating ||
      !name ||
      !name.length ||
      Object.keys(inputs).length === 0
    ) {
      return true;
    }
  };

  const createCredential = async () => {
    if (!selectedCredentialDefinition) {
      return;
    }
    await mutateAsync({
      name,
      credentialName: selectedCredentialDefinition?.name,
      data: inputs,
    });
    setOpenNewCredentialModal(false);
  };

  return (
    <Modal
      isOpen={openNewCredentialModal}
      onOpenChange={() => setOpenNewCredentialModal(false)}
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    New Credential
                  </h3>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="border-t pt-6">
                <div className="flex flex-col gap-4">
                  {!isLoadingCredentialDefinitions && credentialDefinitions && (
                    <>
                      <Autocomplete
                        selectedKey={selectedCredentialDefinition?.name}
                        aria-label={"Credential Definition"}
                        startContent={
                          selectedCredentialDefinitionIcon ? (
                            <img
                              className="w-6 h-6"
                              alt={String(
                                selectedCredentialDefinition?.name ?? "",
                              )}
                              src={getIconUrl(selectedCredentialDefinitionIcon)}
                            />
                          ) : null
                        }
                        onSelectionChange={(key) => {
                          if (key !== selectedCredentialDefinition?.name) {
                            const credentialDefinition =
                              credentialDefinitions?.find(
                                (definition) => definition.name === key,
                              );
                            if (credentialDefinition) {
                              setName("");
                              setInputs({});
                              setSelectedCredentialDefinition(
                                credentialDefinition,
                              );
                            }
                          }
                        }}
                      >
                        {credentialDefinitions.map((definition) => {
                          return (
                            <AutocompleteItem
                              key={definition.name}
                              startContent={
                                definition.icon ? (
                                  <img
                                    className="w-6 h-6"
                                    alt={definition.name}
                                    src={getIconUrl(definition.icon)}
                                  />
                                ) : null
                              }
                            >
                              {definition.label}
                            </AutocompleteItem>
                          );
                        })}
                      </Autocomplete>
                      <StringInput
                        property={{
                          label: "Name",
                          name: "name",
                          type: "string",
                          description:
                            "A descriptive name to help you identify this credential.",
                        }}
                        propertyPath={"name"}
                        inputs={{
                          name,
                        }}
                        onInputChange={(_path, value) => {
                          setName(value as string);
                        }}
                      />
                      {selectedCredentialDefinition && (
                        <div className="flex flex-col gap-3">
                          <Properties
                            inputs={inputs}
                            properties={selectedCredentialDefinition.properties}
                            onInputChange={(path, value) => {
                              setInputs((prevState) => {
                                return {
                                  ...prevState,
                                  [path]: value as string,
                                };
                              });
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="rounded-lg bg-default-200 text-foreground-500 border-none p-0 w-fit outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 hover:outline-none hover:ring-0 active:outline-none active:ring-0 hover:bg-default-200"
                variant="light"
                size="lg"
                onPress={() => setOpenNewCredentialModal(false)}
              >
                Close
              </Button>
              {selectedCredentialDefinition && (
                <Button
                  className="rounded-lg hover:border-transparent focus:outline-none"
                  color={"primary"}
                  size="lg"
                  isLoading={isCreating}
                  isDisabled={isSaveDisabled()}
                  onPress={createCredential}
                  startContent={
                    !isCreating && (
                      <Icon icon="lucide:save" width={16} height={16} />
                    )
                  }
                >
                  Create
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default NewCredentialModal;
