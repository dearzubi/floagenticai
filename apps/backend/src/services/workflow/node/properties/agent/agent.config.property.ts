import { NodeProperty, NodePropertyOption } from "common";
import {
  getModelProviderProperties,
  modelProviderNames,
} from "./provider/index.js";
import { z } from "zod/v4";
import { openAIProviderPropertiesSchema } from "./provider/openai.properties.js";
import { googleGenAIProviderPropertiesSchema } from "./provider/google.genai.properties.js";
import { anthropicProviderPropertiesSchema } from "./provider/anthropic.properties.js";
import { deepseekProviderPropertiesSchema } from "./provider/deepseek.properties.js";
import { openrouterProviderPropertiesSchema } from "./provider/openrouter.properties.js";

/**
 * Agent configurations node property for workflow nodes.
 * @param options - Optional configuration options to disable certain properties.
 */
const getAgentConfigurationsNodeProperty = (options?: {
  disableInstructionsProperty?: boolean;
  disableStreamingProperty?: boolean;
  disableInputMessageProperty?: boolean;
  disableOutputStructureProperty?: boolean;
  disableMaxTokensProperty?: boolean;
  disableMemoryProperty?: boolean;
}): NodeProperty => {
  const modelProviderProperties = getModelProviderProperties();

  return {
    label: "Agent Configurations",
    name: "agent_configurations",
    type: "section",
    collection: [
      {
        name: "model_provider",
        label: "Model Provider",
        type: "options",
        options: modelProviderProperties.map((provider) => {
          return {
            name: provider.name,
            label: provider.label,
            icon: provider.icon,
          } satisfies NodePropertyOption;
        }),
        default: modelProviderProperties[0]?.name,
      },
      ...modelProviderProperties.map((provider) => {
        return {
          label: `${provider.label} Model Settings`,
          name: `${provider.name}`,
          type: "propertyCollection",
          collection: provider.modelSettings.map((setting) => {
            if (
              setting.name === "streaming" &&
              options?.disableStreamingProperty
            ) {
              setting.hidden = true;
              setting.default = false;
            }
            if (
              setting.name === "maxTokens" &&
              options?.disableMaxTokensProperty
            ) {
              setting.hidden = true;
            }
            return setting;
          }),
          optional: true,
          displayOptions: {
            show: {
              "agent_configurations.model_provider": [provider.name],
            },
          },
        } satisfies NodeProperty;
      }),
      {
        name: "enable_memory",
        label: "Enable Memory",
        type: "boolean",
        optional: true,
        default: true,
        description:
          "Whether agent should remember conversation history or not.",
        hidden: options?.disableMemoryProperty ?? false,
      },
      {
        name: "instructions",
        label: "Instructions",
        type: "string",
        optional: true,
        description:
          "The system prompt that tells the model who it is and how it should respond.",
        isMultiline: true,
        hidden: options?.disableInstructionsProperty ?? false,
        default: "",
      },
      {
        name: "input_message",
        label: "Input Message",
        type: "string",
        description:
          "The message that the model will receive as input in addition to any input prompt.",
        default: "",
        isMultiline: true,
        optional: true,
        hidden: options?.disableInputMessageProperty ?? false,
      },
      {
        name: "output_structure",
        label: "Output Structure",
        type: "jsonSchema",
        description:
          "Define the JSON structure of the output. This will be used to parse the output of the model.",
        optional: true,
        hidden: options?.disableOutputStructureProperty ?? false,
      },
    ],
  };
};

const agentConfigurationsPropertyInputSchema = z.object({
  agent_configurations: z
    .object({
      enable_memory: z
        .boolean({
          error: "Enable memory must be true or false",
        })
        .nullish()
        .transform((v) => (typeof v === "boolean" ? v : true)),
      instructions: z
        .string({
          error: "Instructions must be a valid string",
        })
        .nullish()
        .transform((v) => v ?? ""),
      input_message: z
        .string({
          error: "Input message must be a valid string",
        })
        .nullish()
        .transform((v) => v ?? ""),
      output_structure: z
        .record(z.string(), z.unknown())
        .nullish()
        .transform((v) =>
          v !== null && !Array.isArray(v) && typeof v === "object"
            ? v
            : undefined,
        ),
      model_provider: z.enum(modelProviderNames),
    })
    .extend({
      ...openAIProviderPropertiesSchema.shape,
      ...googleGenAIProviderPropertiesSchema.shape,
      ...anthropicProviderPropertiesSchema.shape,
      ...deepseekProviderPropertiesSchema.shape,
      ...openrouterProviderPropertiesSchema.shape,
    }),
});

export type AgentConfigurationsPropertyInput = z.infer<
  typeof agentConfigurationsPropertyInputSchema
>["agent_configurations"];

export {
  getAgentConfigurationsNodeProperty,
  agentConfigurationsPropertyInputSchema,
};
