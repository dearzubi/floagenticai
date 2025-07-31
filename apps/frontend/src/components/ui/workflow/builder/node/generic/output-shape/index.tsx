import { FC, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Tooltip, Divider } from "@heroui/react";
import { JSONSchemaDraft07 } from "common";
import { validateDraft07JSONSchema } from "../../../../../../../utils/draft-07-schema.ts";
import SchemaProperty from "./SchemaProperty.tsx";

const OutputShape: FC<{
  nodeOutputSchema: JSONSchemaDraft07;
  userDefinedOutputStructureSchema?: JSONSchemaDraft07;
}> = ({ nodeOutputSchema, userDefinedOutputStructureSchema }) => {
  const combinedOutputShape = useMemo(() => {
    if (!nodeOutputSchema || !validateDraft07JSONSchema(nodeOutputSchema)) {
      return {
        type: "object",
        properties: {},
        additionalProperties: false,
      } satisfies JSONSchemaDraft07;
    }

    if (
      !userDefinedOutputStructureSchema ||
      !validateDraft07JSONSchema(userDefinedOutputStructureSchema)
    ) {
      return nodeOutputSchema;
    }

    // Ensure the user schema itself is an object schema; if user provided a non-object
    // root, wrap it so OutputShape renders correctly.
    const normalisedUserSchema: JSONSchemaDraft07 =
      userDefinedOutputStructureSchema.type === "object"
        ? userDefinedOutputStructureSchema
        : {
            type: "object",
            properties: {
              value: userDefinedOutputStructureSchema,
            },
          };

    if (nodeOutputSchema.type === "object") {
      return {
        ...nodeOutputSchema,
        properties: {
          ...(nodeOutputSchema.properties ?? {}),
          structuredOutput: normalisedUserSchema,
        },
      } as JSONSchemaDraft07;
    }

    return {
      type: "object",
      properties: {
        structuredOutput: normalisedUserSchema,
      },
    } as JSONSchemaDraft07;
  }, [nodeOutputSchema, userDefinedOutputStructureSchema]);

  if (!nodeOutputSchema || !validateDraft07JSONSchema(nodeOutputSchema)) {
    return null;
  }

  return (
    <>
      <Divider className="my-4 bg-default-200" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-gray-700">Outputs</h3>
          <Tooltip
            content={
              "Outputs produced by this node. These can be referenced in variables."
            }
            classNames={{
              content: "max-w-lg",
            }}
            closeDelay={100}
          >
            <Icon icon="mdi:information-outline" className="w-4 h-4" />
          </Tooltip>
        </div>
        <div className="border rounded-lg bg-white overflow-hidden">
          {combinedOutputShape.properties &&
            Object.entries(combinedOutputShape.properties).map(
              ([key, value]) => (
                <SchemaProperty
                  key={key}
                  name={key}
                  schema={value as JSONSchemaDraft07}
                  isRequired={
                    combinedOutputShape.required?.includes(key) || false
                  }
                />
              ),
            )}
        </div>
      </div>
    </>
  );
};

export default OutputShape;
