import { FC } from "react";
import { IGridItem, INodeProperty, WorkflowBuilderUINodeData } from "common";
import Properties from "../generic/Properties.tsx";
import { Icon } from "@iconify/react";
import GridInput from "./GridInput.tsx";

const GridItem: FC<{
  gridItem: IGridItem;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
  parentGridLabel?: string;
  breadcrumbTrail?: string[];
  nodeName?: string;
  isLoading?: boolean;
  onCredentialChange?: (
    credentialName: string,
    credentialId: string | null,
  ) => void;
  selectedVersion?: WorkflowBuilderUINodeData["versions"][number];
}> = ({
  gridItem,
  inputs,
  propertyPath,
  onInputChange,
  readOnly = false,
  parentGridLabel,
  breadcrumbTrail = [],
  nodeName,
  isLoading,
  onCredentialChange,
  selectedVersion,
}) => {
  if (!gridItem.collection) {
    return (
      <div className="text-center text-sm text-default-500 py-4">
        No configuration options available for this item.
      </div>
    );
  }

  const hasGridProperties = gridItem.collection?.some(
    (prop) => prop.type === "grid",
  );

  return (
    <div className="flex flex-col gap-4">
      {gridItem.description && (
        <p className="text-sm text-default-600">{gridItem.description}</p>
      )}

      {hasGridProperties && parentGridLabel && (
        <div className="flex items-center gap-1 text-xs text-default-500">
          {breadcrumbTrail.map((item, index) => (
            <div key={item + index} className="flex items-center gap-1">
              {index > 0 && (
                <Icon icon="lucide:chevron-right" className="w-3 h-3" />
              )}
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      <Properties
        properties={gridItem.collection || []}
        inputs={inputs}
        propertyPath={propertyPath}
        onInputChange={onInputChange}
        readOnly={readOnly}
        breadcrumbTrail={breadcrumbTrail}
        nodeName={nodeName}
        isLoading={isLoading}
        onCredentialChange={onCredentialChange}
        selectedVersion={selectedVersion}
      />
    </div>
  );
};

export default GridItem;
