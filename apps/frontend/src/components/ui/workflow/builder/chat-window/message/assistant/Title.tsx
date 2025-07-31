import { FC } from "react";
import { Icon } from "@iconify/react";
import { cn } from "../../../../../../../utils/ui.ts";
import { NODE_SETTINGS } from "../../../node/constants.ts";
import { NodeNames } from "common";

const Title: FC<{
  currentStatus: {
    text: string;
    className: string;
    icon: string;
  } | null;
  friendlyName: string;
  nodeName?: NodeNames;
}> = ({ currentStatus, friendlyName, nodeName }) => {
  const icon = nodeName ? NODE_SETTINGS[nodeName].icon : undefined;
  const nodeColor = nodeName ? NODE_SETTINGS[nodeName].color : undefined;

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center gap-2">
        {icon && nodeColor && (
          <div
            className="flex flex-shrink-0 items-center justify-center rounded-md p-1"
            style={{
              // backgroundColor: `white`,
              border: `1px solid ${nodeColor}40`,
            }}
          >
            <Icon
              icon={icon}
              className="h-5 w-5"
              style={{ color: nodeColor }}
            />
          </div>
        )}

        <span className="font-bold text-gray-700">{friendlyName}</span>
      </div>
      {currentStatus && (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${currentStatus.className} inline-flex items-center gap-1`}
        >
          <Icon
            icon={currentStatus.icon}
            className={cn(
              "h-3 w-3",
              currentStatus.icon === "lucide:loader-2" && "animate-spin",
            )}
          />
          {currentStatus.text}
        </span>
      )}
    </div>
  );
};

export default Title;
