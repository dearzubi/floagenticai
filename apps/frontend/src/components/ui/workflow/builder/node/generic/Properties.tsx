import { FC } from "react";
import { INodeProperty, WorkflowBuilderUINodeData } from "common";
import OptionsInput from "../inputs/OptionsInput.tsx";
import { shouldDisplayProperty } from "../utils.ts";
import { Accordion, AccordionItem } from "@heroui/react";
import StringInput from "../inputs/StringInput.tsx";
import NumberInput from "../inputs/NumberInput.tsx";
import BooleanInput from "../inputs/BooleanInput.tsx";
import PasswordInput from "../inputs/PasswordInput.tsx";
import JsonSchemaInput from "../inputs/json-schema/JsonSchemaInput.tsx";
import ArrayInput from "../inputs/ArrayInput.tsx";
import MultiOptionsInput from "../inputs/MultiOptionsInput.tsx";
import CredentialInput from "../inputs/CredentialInput.tsx";

const Properties: FC<{
  properties: INodeProperty[];
  inputs: Record<string, unknown>;
  propertyPath?: string;
  onInputChange?: (path: string, value: unknown) => void;
  selectedVersion?: WorkflowBuilderUINodeData["versions"][number];
  onCredentialChange?: (
    credentialName: string,
    credentialId: string | null,
  ) => void;
  readOnly?: boolean;
}> = ({
  properties,
  inputs,
  propertyPath,
  onInputChange,
  selectedVersion,
  onCredentialChange,
  readOnly = false,
}) => {
  return (
    <>
      {properties
        .filter((property) =>
          shouldDisplayProperty(property, inputs, propertyPath),
        )
        .map((property) => {
          const fullPath = propertyPath
            ? `${propertyPath}.${property.name}`
            : property.name;

          if (property.type === "options" && property.options) {
            return (
              <OptionsInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (property.type === "multiOptions" && property.options) {
            return (
              <MultiOptionsInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (property.type === "string") {
            return (
              <StringInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (property.type === "password") {
            return (
              <PasswordInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (
            property.type === "number" ||
            property.type === "positiveNumber"
          ) {
            return (
              <NumberInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (property.type === "boolean") {
            return (
              <BooleanInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (property.type === "jsonSchema") {
            return (
              <JsonSchemaInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (
            property.type === "propertyCollection" &&
            Array.isArray(property.collection)
          ) {
            return (
              <Accordion
                key={property.name}
                className="px-0"
                variant="bordered"
              >
                <AccordionItem
                  key={property.name}
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
                      properties={property.collection}
                      inputs={inputs}
                      propertyPath={fullPath}
                      onInputChange={onInputChange}
                      selectedVersion={selectedVersion}
                      onCredentialChange={onCredentialChange}
                      readOnly={readOnly}
                    />
                  </div>
                </AccordionItem>
              </Accordion>
            );
          } else if (
            property.type === "array" &&
            Array.isArray(property.collection)
          ) {
            return (
              <ArrayInput
                key={property.name}
                property={property}
                inputs={inputs}
                propertyPath={fullPath}
                onInputChange={onInputChange}
                readOnly={readOnly}
              />
            );
          } else if (property.type === "credential") {
            const credentialId = selectedVersion?.credentials?.find(
              (id) => id.name === property.name,
            )?.id;

            return (
              <CredentialInput
                key={property.name}
                label={property.label}
                isOptional={property.optional}
                credentialName={property.name}
                selectedCredentialId={credentialId}
                onCredentialChange={(credentialId) =>
                  onCredentialChange?.(property.name, credentialId)
                }
                readOnly={readOnly}
              />
            );
          } else if (
            property.type === "section" &&
            Array.isArray(property.collection)
          ) {
            return (
              <div
                key={property.name}
                className={
                  "flex flex-col gap-4 border border-default-100 rounded p-2 shadow-sm"
                }
              >
                <h3 className=" text-lg font-semibold text-default-800">
                  {property.label}
                </h3>
                <Properties
                  properties={property.collection}
                  inputs={inputs}
                  propertyPath={fullPath}
                  onInputChange={onInputChange}
                  selectedVersion={selectedVersion}
                  onCredentialChange={onCredentialChange}
                  readOnly={readOnly}
                />
              </div>
            );
          }
        })}
      {properties.length === 0 && (
        <div className="flex flex-col gap-4 mt-2 px-2 text-center">
          <p className="text-sm text-default-500">
            This node does not have any configurations
          </p>
        </div>
      )}
    </>
  );
};

export default Properties;
