import { FC } from "react";
import { Accordion, AccordionItem, Button, Tooltip } from "@heroui/react";
import { INodeProperty } from "common";
import { getNestedValue } from "../utils.ts";
import Properties from "../generic/Properties.tsx";
import { Icon } from "@iconify/react";
/**
 * Builds an initial value object for a property collection by walking its child properties
 * and assigning each child either its default value or null. Recurses for nested collections.
 */
const buildInitialCollectionInputs = (
  properties: INodeProperty[],
): Record<string, unknown> => {
  const obj: Record<string, unknown> = {};
  for (const prop of properties) {
    if (prop.type === "propertyCollection" && prop.collection) {
      obj[prop.name] = buildInitialCollectionInputs(prop.collection);
    } else {
      obj[prop.name] = prop.default ?? null;
    }
  }
  return obj;
};

const ArrayInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  readOnly?: boolean;
}> = ({ property, inputs, propertyPath, onInputChange, readOnly = false }) => {
  if (!property.collection) {
    return null;
  }

  const currentArray = Array.isArray(getNestedValue(inputs, propertyPath))
    ? (getNestedValue(inputs, propertyPath) as unknown[])
    : [];

  const handleAdd = () => {
    const newItem = buildInitialCollectionInputs(property.collection!);
    onInputChange?.(propertyPath, [...currentArray, newItem]);
  };

  const handleRemove = (index: number) => {
    const newArr = [...currentArray];
    newArr.splice(index, 1);
    onInputChange?.(propertyPath, newArr);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{property.label}</span>
        {!readOnly && (
          <Button
            size="sm"
            variant="flat"
            onPress={handleAdd}
            className={"hover:border-transparent focus:outline-none"}
          >
            Add
          </Button>
        )}
      </div>

      {currentArray.length === 0 && (
        <p className="text-xs text-default-500">No items added</p>
      )}

      {currentArray.map((_item, index) => {
        const itemPath = `${propertyPath}.${index}`;
        return (
          <Accordion key={itemPath} className="px-0" variant="bordered">
            <AccordionItem
              aria-label={`${property.label} ${index + 1}`}
              title={
                <div className={"flex gap-2 justify-between items-center"}>
                  <p>
                    {property.label} {index + 1}
                  </p>
                  {!readOnly && (
                    <Tooltip content={"Remove"} closeDelay={200}>
                      <Button
                        isIconOnly={true}
                        size="sm"
                        className="hover:border-transparent focus:outline-none bg-white rounded-full"
                        onPress={() => handleRemove(index)}
                      >
                        <Icon
                          icon={"lucide:trash"}
                          className="w-4 h-4 text-danger-500 "
                        />
                      </Button>
                    </Tooltip>
                  )}
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
                  properties={property.collection || []}
                  inputs={inputs}
                  propertyPath={itemPath}
                  onInputChange={onInputChange}
                  readOnly={readOnly}
                />
              </div>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
};

export default ArrayInput;
