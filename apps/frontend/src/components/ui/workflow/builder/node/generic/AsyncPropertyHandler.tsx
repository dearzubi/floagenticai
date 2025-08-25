import { Accordion, AccordionItem, Button } from "@heroui/react";
import { FC } from "react";
import { INodeProperty, WorkflowBuilderUINodeData } from "common";
import { useAsyncPropertyLoader } from "../../../../../../hooks/workflow/api/async-property-loader.hooks.ts";
import OptionsInput from "../inputs/OptionsInput.tsx";
import MultiOptionsInput from "../inputs/MultiOptionsInput.tsx";
import Properties from "./Properties.tsx";

const defaultBreadcrumbTrail: string[] = [];

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
  breadcrumbTrail = defaultBreadcrumbTrail,
}) => {
  const { data, isLoading, isError, isBackgroundLoading, hasData, refresh } =
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
          {property.type === "asyncOptions" ||
          property.type === "asyncMultiOptions"
            ? "options"
            : "collection"}
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
        <div className="flex-1">
          <OptionsInput
            property={propertyWithLoadedOptions}
            inputs={inputs}
            propertyPath={propertyPath}
            onInputChange={onInputChange}
            readOnly={readOnly}
            isLoading={false}
            asyncControls={{
              refresh,
              isBackgroundLoading,
            }}
          />
        </div>
        {isError && hasData && (
          <p className="text-warning-600 text-xs mt-1">
            Failed to refresh options - showing cached data
          </p>
        )}
      </div>
    );
  } else if (property.type === "asyncMultiOptions") {
    const propertyWithLoadedOptions: INodeProperty = {
      ...property,
      options: data?.options || property.options,
    };

    return (
      <div className="relative">
        <div className="flex-1">
          <MultiOptionsInput
            property={propertyWithLoadedOptions}
            inputs={inputs}
            propertyPath={propertyPath}
            onInputChange={onInputChange}
            readOnly={readOnly}
            isLoading={false}
            asyncControls={{
              refresh,
              isBackgroundLoading,
            }}
          />
        </div>
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
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={refresh}
                    isLoading={isBackgroundLoading}
                    className="min-w-6 h-6 hover:border-transparent focus:outline-none"
                    title="Refresh collection"
                  >
                    {!isBackgroundLoading && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
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
