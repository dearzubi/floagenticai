import { Tool } from "@openai/agents";
import { OneInchToolsContext } from "./tools/types.js";
import { oneInchTools } from "./tools/index.js";
import { ValidatedInputs } from "./schemas.js";

/**
 * Get selected 1Inch tools.
 * Also evaluates if the selected tool needs approval before execution
 * @param validatedInputs Schema validated inputs
 */
export const getSelectedOneInchTools = (
  validatedInputs: ValidatedInputs,
): Tool<OneInchToolsContext>[] => {
  const selectedTools: Tool<OneInchToolsContext>[] = [];

  for (const toolName of validatedInputs.tools || []) {
    const tool = oneInchTools[toolName];

    if (!tool) {
      continue;
    }

    selectedTools.push(
      tool(validatedInputs.toolsNeedApproval?.includes(toolName)),
    );
  }

  return selectedTools;
};
