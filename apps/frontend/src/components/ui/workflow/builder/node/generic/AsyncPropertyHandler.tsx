import { Accordion, AccordionItem } from "@heroui/react";
import { FC } from "react";
import { INodeProperty, WorkflowBuilderUINodeData } from "common";
import { useLoadMethod } from "../../../../../../hooks/workflow/api/node.api.hooks.ts";
import OptionsInput from "../inputs/OptionsInput.tsx";
import Properties from "./Properties.tsx";

const AsyncPropertyHandler: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  fullPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  selectedVersion?: WorkflowBuilderUINodeData["versions"][number];
  nodeName?: string;
  onCredentialChange?: (
    credentialName: string,
    credentialId: string | null,
  ) => void;
  readOnly?: boolean;
  breadcrumbTrail?: string[];
}> = ({
  property,
  inputs,
  fullPath,
  onInputChange,
  selectedVersion,
  nodeName,
  onCredentialChange,
  readOnly = false,
  breadcrumbTrail = [],
}) => {
  const { data, isLoading, error, isError } = useLoadMethod({
    nodeName: nodeName || "",
    methodName: property.loadMethod || "",
    inputs: inputs,
    enabled: !!property.loadMethod,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-danger-50 rounded-lg">
        <p className="text-danger-700 text-sm">
          Failed to load{" "}
          {property.type === "asyncOptions" ? "options" : "collection"}
        </p>
      </div>
    );
  }

  if (property.type === "asyncOptions") {
    const propertyWithLoadedOptions: INodeProperty = {
      ...property,
      options: data?.options || property.options,
    };

    return (
      <OptionsInput
        property={propertyWithLoadedOptions}
        inputs={inputs}
        propertyPath={fullPath}
        onInputChange={onInputChange}
        readOnly={readOnly}
        isLoading={isLoading}
      />
    );
  } else if (property.type === "asyncPropertyCollection") {
    const propertyWithLoadedCollection: INodeProperty = {
      ...property,
      collection: data?.collection || property.collection,
    };

    return (
      <Accordion className="px-0" variant="bordered">
        <AccordionItem
          aria-label={property.label}
          title={property.label}
          classNames={{
            trigger:
              "border-none bg-default-100 hover:bg-default-200 transition-colors py-2.5 px-3 focus:outline-none data-[open=true]:rounded-b-none",
            title: "text-sm",
          }}
        >
          <div className="flex flex-col gap-4 mt-2 px-2">
            <Properties
              properties={propertyWithLoadedCollection.collection || []}
              inputs={inputs}
              propertyPath={fullPath}
              onInputChange={onInputChange}
              selectedVersion={selectedVersion}
              nodeName={nodeName}
              onCredentialChange={onCredentialChange}
              readOnly={readOnly}
              breadcrumbTrail={breadcrumbTrail}
              isLoading={isLoading}
            />
          </div>
        </AccordionItem>
      </Accordion>
    );
  }

  return null;
};

export default AsyncPropertyHandler;
