import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INodeProperty, WorkflowBuilderUINodeData } from "common";
import { Card, CardBody, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import GridItem from "./GridItem.tsx";
import { cn } from "../../../../../../utils/ui.ts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: -10,
    opacity: 0,
  },
} as const;

const GridInput: FC<{
  property: INodeProperty;
  inputs: Record<string, unknown>;
  propertyPath: string;
  onInputChange?: (path: string, value: unknown) => void;
  selectedVersion?: WorkflowBuilderUINodeData["versions"][number];
  readOnly?: boolean;
  breadcrumbTrail?: string[];
  nodeName?: string;
  isLoading?: boolean;
  onCredentialChange?: (
    credentialName: string,
    credentialId: string | null,
  ) => void;
}> = ({
  property,
  inputs,
  propertyPath,
  onInputChange,
  readOnly = false,
  breadcrumbTrail = [],
  selectedVersion,
  nodeName,
  isLoading,
  onCredentialChange,
}) => {
  const [selectedGridItem, setSelectedGridItem] = useState<string | null>(null);

  if (!property.gridItems) {
    return null;
  }

  const handleGridItemClick = (gridItemName: string) => {
    if (!readOnly) {
      setSelectedGridItem(gridItemName);
    }
  };

  const handleBackToGrid = () => {
    setSelectedGridItem(null);
  };

  if (selectedGridItem) {
    const selectedGridItemData = property.gridItems.find(
      (item) => item.name === selectedGridItem,
    );

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="grid-item-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-center gap-2">
              <Tooltip content={"Back to " + property.label} closeDelay={200}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="rounded-full hover:border-transparent focus:outline-none"
                  onPress={handleBackToGrid}
                >
                  <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                </Button>
              </Tooltip>
              <span className="text-sm font-medium">
                {selectedGridItemData?.label}
              </span>
            </div>

            {/* Breadcrumb trail */}
            <div className="flex items-center gap-1 ml-10 text-xs text-default-500">
              {breadcrumbTrail.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && (
                    <Icon icon="lucide:chevron-right" className="w-3 h-3" />
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-default-50 dark:bg-default-100 rounded-lg border border-default-200">
            <GridItem
              gridItem={selectedGridItemData!}
              inputs={inputs}
              propertyPath={`${propertyPath}.${selectedGridItem}`}
              onInputChange={onInputChange}
              readOnly={readOnly}
              parentGridLabel={property.label}
              breadcrumbTrail={[
                property.label,
                selectedGridItemData?.label || "",
              ]}
              nodeName={nodeName}
              isLoading={isLoading}
              onCredentialChange={onCredentialChange}
              selectedVersion={selectedVersion}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="grid-view"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-default-800">
            {property.label}
          </span>
        </div>

        {property.description && (
          <p className="text-xs text-default-500">{property.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {property.gridItems.map((gridItem) => {
            return (
              <motion.div key={gridItem.name} variants={itemVariants}>
                <Card
                  isPressable={!readOnly}
                  className={cn(
                    "transition-all duration-300 ease-in-out cursor-pointer shadow-sm border-default-200 w-[220px]",
                    "bg-white dark:bg-default-100",
                    "focus:outline-none hover:border-default-200 hover:bg-default-50",
                    readOnly && "cursor-default",
                  )}
                  onPress={() => handleGridItemClick(gridItem.name)}
                >
                  <CardBody className="p-4">
                    <div className="flex flex-col items-center text-center gap-4">
                      {gridItem.icon && (
                        <div className="flex-shrink-0">
                          <Icon
                            icon={gridItem.icon}
                            className="w-8 h-8 text-primary-500"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-default-800">
                          {gridItem.label}
                        </h3>
                        {gridItem.description && (
                          <p className="text-xs text-default-500">
                            {gridItem.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GridInput;
