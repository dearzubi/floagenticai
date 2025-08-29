import { AgentToolFactory } from "../types.js";
import { Tool } from "@openai/agents";

/**
 * Initializes tools to be used by an agent using the provided tool factories and configurations.
 * @param toolsList
 * @param selectedToolsList
 * @param toolsNeedsApproval
 * @param toolFactories
 */
const initAgentTools = <toolName extends string = string, Context = unknown>({
  toolsList,
  selectedToolsList,
  toolsNeedsApproval,
  toolFactories,
}: {
  toolsList: toolName[];
  selectedToolsList: toolName[];
  toolsNeedsApproval: toolName[];
  toolFactories: Map<toolName, AgentToolFactory<Context>>;
}): Tool<Context>[] => {
  const tools: Tool<Context>[] = [];

  for (const toolName of toolsList) {
    if (!selectedToolsList.includes(toolName)) {
      continue;
    }

    const toolFactory = toolFactories.get(toolName);

    if (!toolFactory) {
      continue;
    }

    const tool = toolFactory({
      needsApproval: toolsNeedsApproval.includes(toolName),
    });

    tools.push(tool);
  }

  return tools;
};

export { initAgentTools };
