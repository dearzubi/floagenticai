import { FC } from "react";
import { cn } from "../../../../../../utils/ui.ts";
import { Icon } from "@iconify/react";
import { WorkflowBuilderUINodeData } from "common";
import { NODE_SETTINGS } from "../constants.ts";
import { getPropertyInputValue } from "../utils.ts";
import { getIconUrl } from "../../../../../../utils/misc.ts";

const getModelProviderIcon = (nodeData: WorkflowBuilderUINodeData) => {
  const selectedVersion = nodeData.versions.find(
    (v) => v.version === nodeData.currentVersion,
  );

  const modelProperty = selectedVersion?.properties.find(
    (p) => p.name === "model_provider",
  );

  if (modelProperty && modelProperty.options && selectedVersion?.inputs) {
    const selectedValue = getPropertyInputValue(
      selectedVersion?.inputs,
      modelProperty.name,
      "",
    );

    if (!selectedValue) {
      return;
    }

    const selectedOption = modelProperty.options.find(
      (opt) => opt.name === selectedValue,
    );
    if (selectedOption?.icon) {
      return getIconUrl(selectedOption.icon);
    }
  }
};

const Info: FC<{
  nodeData: WorkflowBuilderUINodeData;
}> = ({ nodeData }) => {
  const color = NODE_SETTINGS[nodeData.name]?.color ?? "#A855F7";
  const icon = NODE_SETTINGS[nodeData.name]?.icon ?? "lucide:box";
  const label = nodeData.label;
  const friendlyName = nodeData.friendlyName;
  const providerIconUrl = getModelProviderIcon(nodeData);

  return (
    <div
      className={cn(
        "w-fit rounded-lg bg-white font-sans transition-all duration-100 cursor-pointer border-2 shadow-sm border-gray-200 pr-4 flex items-center",
      )}
      style={{
        borderColor: color,
      }}
    >
      <div className="flex items-center gap-2.5 p-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon icon={icon} className="h-5 w-5" style={{ color }} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-medium text-gray-800">
            {(friendlyName || label).length > 15
              ? `${(friendlyName || label).substring(0, 15)}...`
              : friendlyName || label}
          </h3>
          {providerIconUrl && (
            <div className="flex items-center mt-1">
              <img src={providerIconUrl} className="h-4 w-4" alt="Provider" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Info;
