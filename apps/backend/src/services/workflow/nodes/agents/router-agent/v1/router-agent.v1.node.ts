import type {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../types.js";
import { NodeVersionDescription } from "common";
import {
  NodeProperty,
  NodePropertyOption,
} from "common/dist/workflow/types.js";
import {
  credentialsSchema,
  inputSchema,
  outputSchema,
  OutputsShape,
  outputStructureSchema,
} from "./schemas.js";
import { Agent } from "@openai/agents";
import { z } from "zod/v4";
import {
  buildAgentInputs,
  getAgentModel,
  getAgentRunner,
  getAPIKey,
  getModelSettings,
} from "../../agent/v1/utils.js";
import {
  handleNodeExecutionError,
  validateNodeExecutionSchema,
} from "../../../utils.js";
import {
  buildRouterAgentInstructions,
  getAgentContextToForwardString,
  getSelectedCondition,
} from "./utils.js";
import { publishWorkflowNodeExecutionEvent } from "../../../../execution-engine/utils.js";
import { modelProviderNodeProperties } from "../../agent/v1/model/node-properties/index.js";

export class RouterAgentV1Node implements INodeVersion {
  description: NodeVersionDescription;

  constructor() {
    this.description = {
      version: 1,
      outputsShape: z.toJSONSchema(outputSchema),
      properties: [
        {
          name: "model_provider",
          label: "Model Provider",
          type: "options",
          options: modelProviderNodeProperties.map((provider) => {
            return {
              name: provider.name,
              label: provider.label,
              icon: provider.icon,
            } satisfies NodePropertyOption;
          }),
          default: modelProviderNodeProperties[0]?.name,
        },
        ...modelProviderNodeProperties.map((provider) => {
          return {
            label: `${provider.label} Model Settings`,
            name: `${provider.name}_model_settings`,
            type: "propertyCollection",
            collection: provider.modelSettings.filter(
              (setting) =>
                !["streaming", "additional_parameters"].includes(setting.name),
            ),
            optional: true,
            displayOptions: {
              show: {
                model_provider: [provider.name],
              },
            },
          } satisfies NodeProperty;
        }),
        // {
        //   name: "instructions",
        //   label: "Instructions",
        //   type: "string",
        //   description:
        //     "Instructions for how the router should evaluate conditions.",
        //   optional: true,
        //   isMultiline: true,
        // },
        {
          name: "conditions",
          label: "Routing Conditions",
          type: "array",
          description:
            "Add one or more routing conditions. The router will evaluate them in order and select the first matching condition.",
          collection: [
            {
              name: "id",
              label: "Condition ID",
              type: "string",
              description: "Unique identifier to represent output route.",
            },
            {
              name: "name",
              label: "Condition Name",
              type: "string",
              description: "Human-readable name for your reference.",
            },
            {
              name: "expression",
              label: "Condition Expression",
              type: "string",
              description: "Describe when should this condition be met.",
              isMultiline: true,
            },
          ],
        },
        {
          name: "default_condition",
          label: "Default Condition ID",
          type: "string",
          optional: true,
          description:
            "ID of the condition to use when no other conditions match",
        },
      ],
    };
  }

  async execute({
    id,
    inputs,
    credentials,
    parentNodeOutputs,
    trigger,
    workflowId,
    executionId,
    friendlyName,
    sessionId,
  }: NodeExecutionInput): Promise<NodeExecutionOutput<OutputsShape>> {
    try {
      const validatedInputs = validateNodeExecutionSchema({
        schema: inputSchema,
        data: inputs,
        nodeId: id,
        errorMessage: "Please provide required and valid inputs",
        workflowId,
        executionId,
      });

      const validatedCredentials = validateNodeExecutionSchema({
        schema: credentialsSchema,
        data: credentials,
        nodeId: id,
        errorMessage: "Please provide all the required credentials",
        workflowId,
        executionId,
      });

      const compatibleInputs = {
        ...validatedInputs,
        enable_memory: false, // Router agents don't need memory
        input_message: "", // No input message needed
        output_structure: undefined,
        instructions: "",
      };

      const userMessage = trigger.data["userMessage"] as string | undefined;

      const apiKey = await getAPIKey(compatibleInputs, validatedCredentials);
      const runner = getAgentRunner(compatibleInputs, apiKey);
      const modelSettings = getModelSettings(compatibleInputs);

      const agentInput = buildAgentInputs({
        parentNodeOutputs,
        userMessage,
      });

      const agent = new Agent({
        name: id,
        model: getAgentModel(compatibleInputs, apiKey),
        instructions: buildRouterAgentInstructions({
          conditions: validatedInputs.conditions,
          defaultConditionId: validatedInputs.default_condition,
          instructions: "",
        }),
        modelSettings: {
          ...modelSettings,
          maxTokens: undefined, // Remove max tokens limit for structured output
        },
        outputType: outputStructureSchema,
      });

      const result = await runner.run(agent, agentInput, {
        stream: false,
      });

      const evaluationResult = result.finalOutput;

      if (!evaluationResult) {
        throw new Error("Router failed to evaluate conditions");
      }

      const selectedCondition = getSelectedCondition(
        evaluationResult.selectedConditionId,
        validatedInputs.conditions,
        validatedInputs.default_condition,
      );

      await publishWorkflowNodeExecutionEvent({
        nodeId: id,
        workflowId,
        executionId,
        sessionId,
        triggerName: trigger.name,
        type: "responded",
        data: {
          content: `**Selected route**: ${selectedCondition.name}`, //\n\n**Reasoning**: ${evaluationResult.reasoning}
        },
      });

      return {
        nodeId: id,
        friendlyName,
        success: true,
        outputs: {
          contextToForward: getAgentContextToForwardString(agentInput),
          selectedCondition: {
            id: selectedCondition.id,
            name: selectedCondition.name,
          },
          evaluationResults: evaluationResult.evaluationResults,
        },
      };
    } catch (error) {
      return await handleNodeExecutionError({
        nodeId: id,
        workflowId,
        executionId,
        error,
        sessionId,
        triggerName: trigger.name,
      });
    }
  }
}
