import { FC } from "react";
import { Select, SelectItem } from "@heroui/react";

const VersionSelector: FC<{
  versionListSorted: { key: string; label: string }[];
  selectedVersionNumber: string;
  setSelectedVersionNumber?: (versionNumber: string) => void;
  readOnly?: boolean;
}> = ({
  versionListSorted,
  selectedVersionNumber,
  setSelectedVersionNumber,
  readOnly = false,
}) => {
  return (
    <>
      {versionListSorted.length > 0 && (
        <Select
          aria-label="Select version"
          selectedKeys={[selectedVersionNumber]}
          isDisabled={readOnly}
          onChange={
            readOnly
              ? undefined
              : (e) => {
                  if (!e.target.value) {
                    setSelectedVersionNumber?.(
                      versionListSorted[versionListSorted.length - 1].key,
                    );
                  } else {
                    setSelectedVersionNumber?.(e.target.value);
                  }
                }
          }
          size="sm"
          className="min-w-24 max-w-24"
          radius="full"
          classNames={{
            trigger:
              "focus:outline-none bg-default-100 hover:bg-default-200 transition-colors border-none",
            innerWrapper: "[&>span]:!text-foreground-500",
            selectorIcon: "text-foreground-500",
          }}
        >
          {versionListSorted.map((v) => (
            <SelectItem key={v.key} className="text-xs">
              {v.label}
            </SelectItem>
          ))}
        </Select>
      )}
    </>
  );
};

export default VersionSelector;
