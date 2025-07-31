import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { INodeProperty } from "common";
import { FC } from "react";

const Label: FC<{
  property: INodeProperty;
}> = ({ property }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-medium text-default-600">
          {property.label}
        </span>
        {!property.optional && (
          <Icon icon="lucide:asterisk" className="w-3 h-3 text-red-500" />
        )}
      </div>
      {property.description && (
        <Tooltip
          content={property.description}
          classNames={{
            content: "max-w-lg",
          }}
          closeDelay={100}
        >
          <Icon
            icon="mdi:information-outline"
            className="w-4 h-4 focus:outline-none"
          />
        </Tooltip>
      )}
    </div>
  );
};

export default Label;
