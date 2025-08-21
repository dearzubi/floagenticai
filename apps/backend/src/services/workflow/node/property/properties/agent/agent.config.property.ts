import { ModelProviders, NodeProperty } from "common";
import { z } from "zod/v4";
import { modelProviderNames } from "../../../../../ai/llm/provider/index.js";
import { advancedModelSettingsSchema } from "./advanced.model.settings.properties.js";

/**
 * Agent configurations node property for workflow nodes.
 * @param options - Optional configuration options to disable certain properties.
 */
const getAgentConfigurationsNodeProperty = (options?: {
  disableInstructionsProperty?: boolean;
  disableOutputStructureProperty?: boolean;
  disableMemoryProperty?: boolean;
}): NodeProperty => {
  return {
    label: "Agent Configurations",
    name: "agent_configurations",
    type: "grid",
    gridItems: [
      {
        name: "llm_configurations",
        label: "Model Configurations",
        icon: "hugeicons:ai-brain-02",
        collection: [
          {
            name: "model_provider",
            label: "Provider",
            type: "asyncOptions",
            loadMethod: "getModelProvidersList",
          },
          {
            name: "model",
            label: "Model",
            type: "asyncOptions",
            loadMethod: "getModelsList",
            displayOptions: {
              show: {
                "agent_configurations.llm_configurations.model_provider": [
                  {
                    _cnd: {
                      not: "openrouter" satisfies ModelProviders,
                    },
                  },
                ],
              },
            },
          },
          {
            name: "modelName",
            label: "Model",
            type: "string",
            placeholder: "anthropic/claude-sonnet-4",
            displayOptions: {
              show: {
                "agent_configurations.llm_configurations.model_provider": [
                  {
                    _cnd: {
                      eq: "openrouter" satisfies ModelProviders,
                    },
                  },
                ],
              },
            },
          },
          {
            name: "advanced_settings",
            label: "Advanced Settings",
            type: "asyncPropertyCollection",
            loadMethod: "getAdvancedModelSettings",
          },
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
            name: "output_structure",
            label: "Output Structure",
            type: "jsonSchema",
            description:
              "Define the JSON structure of the output. This will be used to parse the output of the model.",
            optional: true,
            hidden: options?.disableOutputStructureProperty ?? false,
          },
        ],
      },
    ],
  };
};

const agentConfigurationsPropertyInputSchema = z.object({
  agent_configurations: z.object({
    llm_configurations: z.object({
      model_provider: z
        .enum(modelProviderNames)
        .nullish()
        .transform((v) => (typeof v === "string" ? v : undefined)),
      model: z
        .string()
        .nullish()
        .transform((v) => (typeof v === "string" ? v : undefined)),
      modelName: z
        .string()
        .nullish()
        .transform((v) => (typeof v === "string" ? v : undefined)),

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
      output_structure: z
        .record(z.string(), z.unknown())
        .nullish()
        .transform((v) =>
          v !== null && !Array.isArray(v) && typeof v === "object"
            ? v
            : undefined,
        ),
      advanced_settings: advancedModelSettingsSchema
        .optional()
        .nullish()
        .transform((v) =>
          typeof v === "object" && v !== null && !Array.isArray(v)
            ? v
            : undefined,
        ),
    }),
  }),
});

type AgentConfigurationsPropertyInput = z.infer<
  typeof agentConfigurationsPropertyInputSchema
>;

export {
  getAgentConfigurationsNodeProperty,
  agentConfigurationsPropertyInputSchema,
  AgentConfigurationsPropertyInput,
};
