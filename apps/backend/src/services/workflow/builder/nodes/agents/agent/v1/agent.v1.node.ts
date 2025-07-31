import type {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../types.js";
import { modelProviders } from "../model-providers/index.js";
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
} from "./schemas.js";
import { Agent, AgentInputItem } from "@openai/agents";
import { z } from "zod/v4";
import {
  buildAgentInputs,
  convertJsonSchemaToZodSchema,
  getAgentModel,
  getAgentRunner,
  getAgentStringifiedFinalOutput,
  getAgentStructuredOutput,
  getAPIKey,
  getHistoryFromAgentMemory,
  getModelSettings,
  isStreamingEnabled,
  updateAgentMemory,
} from "./utils.js";
import { publishWorkflowNodeExecutionEvent } from "../../../../../execution-engine/utils.js";
import {
  handleNodeExecutionError,
  validateNodeExecutionSchema,
} from "../../../utils.js";
import { GENERIC_AGENT_INSTRUCTIONS } from "./constants.js";

export class AgentV1Node implements INodeVersion {
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
          options: modelProviders.map((provider) => {
            return {
              name: provider.name,
              label: provider.label,
              icon: provider.icon,
            } satisfies NodePropertyOption;
          }),
          default: modelProviders[0]?.name,
        },
        ...modelProviders.map((provider) => {
          return {
            label: `${provider.label} Model Settings`,
            name: `${provider.name}_model_settings`,
            type: "propertyCollection",
            collection: provider.modelSettings,
            optional: true,
            displayOptions: {
              show: {
                model_provider: [provider.name],
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
        },
        {
          name: "instructions",
          label: "Instructions",
          type: "string",
          optional: true,
          description:
            "The system prompt that tells the model who it is and how it should respond.",
          isMultiline: true,
        },
        {
          name: "input_message",
          label: "Input Message",
          type: "string",
          description:
            "The message that the model will receive as input. This input will be combined with the user message sent in the chat.",
          isMultiline: true,
          optional: true,
        },
        {
          name: "output_structure",
          label: "Output Structure",
          type: "jsonSchema",
          description:
            "Define the JSON structure of the output. This will be used to parse the output of the model.",
          optional: true,
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
    chatMessageId,
  }: NodeExecutionInput): Promise<NodeExecutionOutput<OutputsShape>> {
    let finalOutput: string | undefined = "";
    let structuredOutput: Record<string, unknown> | undefined;
    let updatedState: Record<string, unknown>;
    let updatedHistory: AgentInputItem[];

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

      const userMessage = trigger.data["userMessage"] as string | undefined;

      const apiKey = await getAPIKey(validatedInputs, validatedCredentials);

      const streamingEnabled = isStreamingEnabled(validatedInputs);

      const memoryEnabled = validatedInputs.enable_memory ?? true;

      const memoryHistory: AgentInputItem[] = [];

      if (memoryEnabled) {
        memoryHistory.push(
          ...(await getHistoryFromAgentMemory({
            workflowId,
            nodeId: id,
            sessionId,
          })),
        );
      }

      const agentInput = buildAgentInputs({
        history: memoryHistory,
        inputMessage: validatedInputs.input_message,
        parentNodeOutputs,
        userMessage,
      });

      const runner = getAgentRunner(validatedInputs, apiKey);
      const modelSettings = getModelSettings(validatedInputs);

      const agent = new Agent({
        name: id,
        instructions: `${GENERIC_AGENT_INSTRUCTIONS}${validatedInputs.instructions || ""}`,
        model: getAgentModel(validatedInputs, apiKey),
        modelSettings: {
          ...modelSettings,
          maxTokens: validatedInputs.output_structure
            ? undefined
            : modelSettings.maxTokens, // Remove max tokens limit if output structure is defined to ensure that the output is valid json
          // parallelToolCalls:
          //   validatedInputs.openai_model_settings?.additional_parameters
          //     ?.parallel_tool_calls, // TODO: handle this when tools are introduced
        },
        //@ts-expect-error - TODO: resolve type inference later
        outputType: validatedInputs.output_structure
          ? convertJsonSchemaToZodSchema(validatedInputs.output_structure)
          : "text",
      });

      // Don't stream if the output structure is defined, output the JSON at once
      if (streamingEnabled && !validatedInputs.output_structure) {
        const result = await runner.run(agent, agentInput, {
          stream: true,
        });

        const textStream = result.toTextStream({
          compatibleWithNodeStreams: true,
        });

        try {
          for await (const chunk of textStream) {
            try {
              const chunkString = chunk.toString();

              finalOutput += chunkString;

              await publishWorkflowNodeExecutionEvent({
                type: "responded",
                sessionId,
                workflowId,
                executionId,
                triggerName: trigger.name,
                nodeId: id,
                data: {
                  content: chunkString,
                },
              });
            } catch (chunkErr) {
              /* empty */
            }
          }
        } catch (streamErr) {
          /* empty */
        }

        await result.completed;

        finalOutput = getAgentStringifiedFinalOutput(result.finalOutput);
        structuredOutput = getAgentStructuredOutput(result.finalOutput);
        updatedState = result.state.toJSON();
        updatedHistory = result.history;
      } else {
        const result = await runner.run(agent, agentInput, {
          stream: false,
        });

        finalOutput = getAgentStringifiedFinalOutput(result.finalOutput);
        structuredOutput = getAgentStructuredOutput(result.finalOutput);
        updatedState = result.state.toJSON();
        updatedHistory = result.history;

        await publishWorkflowNodeExecutionEvent({
          type: "responded",
          sessionId,
          workflowId,
          executionId,
          triggerName: trigger.name,
          nodeId: id,
          data: {
            content: finalOutput || "",
          },
        });
      }
      if (memoryEnabled) {
        await updateAgentMemory({
          sessionId,
          workflowId,
          nodeId: id,
          history: updatedHistory,
          state: updatedState,
        });
      }

      return {
        nodeId: id,
        friendlyName,
        chatMessageId,
        success: true,
        outputs: {
          finalOutput,
          structuredOutput,
        },
      } satisfies NodeExecutionOutput;
    } catch (error) {
      // TODO: this is a temp fix to the issue: https://github.com/openai/openai-agents-js/issues/176
      if (String(error).includes("Model did not") && finalOutput) {
        await publishWorkflowNodeExecutionEvent({
          type: "responded",
          sessionId,
          workflowId,
          executionId,
          triggerName: trigger.name,
          nodeId: id,
          data: {
            content: finalOutput || "",
          },
        });
        return {
          nodeId: id,
          friendlyName,
          chatMessageId,
          success: true,
          outputs: {
            finalOutput: finalOutput,
          },
        } satisfies NodeExecutionOutput;
      }
      //TODO: UI should somehow display or at least alert user about the error, write now it just says Done and nothing shows
      return await handleNodeExecutionError({
        nodeId: id,
        workflowId,
        executionId,
        error,
        sessionId,
        chatMessageId,
        triggerName: trigger.name,
      });
    }
  }
}
