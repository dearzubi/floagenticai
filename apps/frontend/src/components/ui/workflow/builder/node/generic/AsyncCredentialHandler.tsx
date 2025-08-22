import { FC } from "react";
import { Spinner } from "@heroui/react";
import { INodeProperty, WorkflowBuilderUINodeData } from "common";
import { useAsyncPropertyLoader } from "../../../../../../hooks/workflow/api/async-property-loader.hooks.ts";
import CredentialInput from "../inputs/CredentialInput.tsx";

const AsyncCredentialHandler: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  selectedVersion?: WorkflowBuilderUINodeData["versions"][number];
  nodeName?: string;
  onCredentialChange?: (
    credentialName: string,
    credentialId: string | null,
  ) => void;
  readOnly?: boolean;
}> = ({
  property,
  inputs,
  selectedVersion,
  nodeName,
  onCredentialChange,
  readOnly = false,
}) => {
  const { data, isLoading, isError, isBackgroundLoading, hasData } =
    useAsyncPropertyLoader({
      nodeName: nodeName || "",
      methodName: property.loadMethod || "",
      inputs: inputs,
      property,
      enabled: !!property.loadMethod,
    });

  if (isLoading && !hasData) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError && !hasData) {
    return (
      <div className="p-4 bg-danger-50 rounded-lg">
        <p className="text-danger-700 text-sm">
          Failed to load credential type
        </p>
      </div>
    );
  }

  const credentialName = data?.credentialName || property.name;
  const credentialId = selectedVersion?.credentials?.find(
    (cred) => cred.name === credentialName,
  )?.id;

  return (
    <div className="relative">
      {isBackgroundLoading && (
        <div className="absolute top-2 right-2 z-10">
          <Spinner size="sm" color="primary" />
        </div>
      )}
      <CredentialInput
        label={property.label}
        isOptional={property.optional}
        credentialName={credentialName}
        selectedCredentialId={credentialId}
        onCredentialChange={(credentialId) => {
          onCredentialChange?.(credentialName, credentialId);
        }}
        readOnly={readOnly}
      />
      {isError && hasData && (
        <p className="text-warning-600 text-xs mt-1">
          Failed to refresh credential type - using cached data
        </p>
      )}
    </div>
  );
};

export default AsyncCredentialHandler;
