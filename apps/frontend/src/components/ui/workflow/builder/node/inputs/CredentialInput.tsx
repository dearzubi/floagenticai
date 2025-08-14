import { FC, useState } from "react";
import {
  useGetCredentialsByCredentialNames,
  useCredentialDefinitionList,
} from "../../../../../../hooks/credential/api/credential.api.hooks.ts";
import { Autocomplete, AutocompleteItem, Button, Tooltip } from "@heroui/react";
import { getIconUrl } from "../../../../../../utils/misc.ts";
import { Icon } from "@iconify/react";
import NewCredentialModal from "../../../../credential/NewCredentialModal.tsx";
import EditCredentialModal from "../../../../credential/EditCredentialModal.tsx";

export const CredentialInput: FC<{
  label: string;
  description?: string;
  credentialName: string;
  isOptional?: boolean;
  selectedCredentialId?: string;
  onCredentialChange: (credentialId: string | null) => void;
  readOnly?: boolean;
}> = ({
  label,
  description,
  credentialName,
  isOptional,
  selectedCredentialId,
  onCredentialChange,
  readOnly = false,
}) => {
  const [isNewCredentialModalOpen, setIsNewCredentialModalOpen] =
    useState(false);
  const [isEditCredentialModalOpen, setIsEditCredentialModalOpen] =
    useState(false);

  const { data: credentials, isLoading } =
    useGetCredentialsByCredentialNames(credentialName);
  const { data: credentialDefinitions } = useCredentialDefinitionList();

  const credentialDefinition = credentialDefinitions?.find(
    (def) => def.name === credentialName,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-0.5">
          <span className="text-sm font-medium text-default-600">{label}</span>
          {!isOptional && (
            <Icon icon="lucide:asterisk" className="w-3 h-3 text-red-500" />
          )}
        </div>
        {description && (
          <p className="text-xs text-default-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Autocomplete
          aria-label={label}
          placeholder="Select a credential"
          selectedKey={selectedCredentialId || null}
          onSelectionChange={
            readOnly
              ? undefined
              : (key) => onCredentialChange(key as string | null)
          }
          isLoading={isLoading}
          isDisabled={readOnly}
          startContent={
            credentialDefinition?.icon && (
              <img
                src={getIconUrl(credentialDefinition.icon)}
                alt={label}
                className="w-5 h-5"
              />
            )
          }
          className="flex-grow"
          classNames={{
            clearButton: "focus:!outline-none hover:border-transparent",
            selectorButton: "focus:!outline-none hover:border-transparent",
          }}
          inputProps={{
            classNames: {
              inputWrapper: "focus-within:!outline-none focus-within:!ring-0",
              input: "focus:!outline-none focus:ring-0 focus:ring-offset-0",
            },
          }}
        >
          {(credentials || []).map((cred) => (
            <AutocompleteItem key={cred.id}>{cred.name}</AutocompleteItem>
          ))}
        </Autocomplete>
        {!readOnly && (
          <Tooltip
            content={"Edit Credential"}
            classNames={{
              content: "max-w-lg",
            }}
            closeDelay={100}
          >
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setIsEditCredentialModalOpen(true)}
              isDisabled={!selectedCredentialId}
              className="rounded-lg focus:outline-none hover:border-transparent bg-default-100 hover:bg-default-200"
            >
              <Icon icon="lucide:pencil" className="text-default-500" />
            </Button>
          </Tooltip>
        )}
        {!readOnly && (
          <Tooltip
            content={"Create New Credential"}
            classNames={{
              content: "max-w-lg",
            }}
            closeDelay={100}
          >
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setIsNewCredentialModalOpen(true)}
              className="rounded-lg focus:outline-none hover:border-transparent bg-default-100 hover:bg-default-200"
            >
              <Icon icon="lucide:plus" className="text-default-500" />
            </Button>
          </Tooltip>
        )}
      </div>

      <NewCredentialModal
        openNewCredentialModal={isNewCredentialModalOpen}
        setOpenNewCredentialModal={setIsNewCredentialModalOpen}
      />
      {selectedCredentialId && (
        <EditCredentialModal
          credentialId={selectedCredentialId}
          isOpen={isEditCredentialModalOpen}
          onClose={() => setIsEditCredentialModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CredentialInput;
