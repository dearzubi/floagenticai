import { Accordion, AccordionItem, Spinner } from "@heroui/react";
import { FC } from "react";
import { INodeProperty, WorkflowBuilderUINodeData } from "common";
import { useAsyncPropertyLoader } from "../../../../../../hooks/workflow/api/async-property-loader.hooks.ts";
import OptionsInput from "../inputs/OptionsInput.tsx";
import Properties from "./Properties.tsx";

const AsyncPropertyHandler: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
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
  propertyPath,
  onInputChange,
  selectedVersion,
  nodeName,
  onCredentialChange,
  readOnly = false,
  breadcrumbTrail = [],
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
      <div className="relative">
        {isBackgroundLoading && (
          <div className="absolute top-2 right-2 z-10">
            <Spinner size="sm" color="primary" />
          </div>
        )}
        <OptionsInput
          property={propertyWithLoadedOptions}
          inputs={inputs}
          propertyPath={propertyPath}
          onInputChange={onInputChange}
          readOnly={readOnly}
          isLoading={false}
        />
        {isError && hasData && (
          <p className="text-warning-600 text-xs mt-1">
            Failed to refresh options - showing cached data
          </p>
        )}
      </div>
    );
  } else if (property.type === "asyncPropertyCollection") {
    const propertyWithLoadedCollection: INodeProperty = {
      ...property,
      collection: data?.collection || property.collection,
    };

    return (
      <div className="relative">
        <Accordion className="px-0" variant="bordered">
          <AccordionItem
            aria-label={property.label}
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{property.label}</span>
                {isBackgroundLoading && <Spinner size="sm" color="primary" />}
              </div>
            }
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
                propertyPath={propertyPath}
                onInputChange={onInputChange}
                selectedVersion={selectedVersion}
                nodeName={nodeName}
                onCredentialChange={onCredentialChange}
                readOnly={readOnly}
                breadcrumbTrail={breadcrumbTrail}
                isLoading={false}
              />
              {isError && hasData && (
                <p className="text-warning-600 text-xs">
                  Failed to refresh collection - showing cached data
                </p>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return null;
};

export default AsyncPropertyHandler;
