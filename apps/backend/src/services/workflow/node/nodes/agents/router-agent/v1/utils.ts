import { Condition } from "./schemas.js";

/**
 * Build router agent instructions evaluating condition and routing
 * to appropriate routes
 * @param conditions - User defined conditions
 * @param defaultConditionID - ID of the default condition to fallback to
 * @param instructions - User defined instructions
 * @returns {string} Router agent instructions
 */
export const buildRouterAgentInstructions = ({
  conditions,
  defaultConditionId,
  instructions,
}: {
  conditions: Condition[];
  defaultConditionId?: string | null;
  instructions?: string | null;
}): string => {
  const conditionsDescription = conditions
    .map((c) => `- ${c.name} (ID: ${c.id}): ${c.expression}`)
    .join("\n");

  return `
    Evaluate the following conditions based on the user message and previous agent's output and determine which one should be triggered.
    ${instructions ? `Instructions: ${instructions}\n` : ""}
    
    Conditions to evaluate:
    ${conditionsDescription}
  
    ${defaultConditionId ? `Default condition (if no conditions match): ${defaultConditionId}` : "If no conditions match, select the first condition as fallback."}
  
    Important: Only ONE condition should evaluate to true. Select the most appropriate condition based on the context.
  `;
};

/**
 * Get the selected condition based on evaluation
 * @param selectedConditionId - ID of the selected condition
 * @param conditions - Available conditions
 * @param defaultConditionId - Default condition ID
 */
export const getSelectedCondition = (
  selectedConditionId: string,
  conditions: Condition[],
  defaultConditionId?: string | null,
): Condition => {
  const selectedCondition =
    conditions.find((c) => c.id === selectedConditionId) ||
    conditions.find((c) => c.id === defaultConditionId);

  if (!selectedCondition) {
    throw new Error(
      "No condition was selected and no default condition was provided",
    );
  }

  return selectedCondition;
};
