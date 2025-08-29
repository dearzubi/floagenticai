import { AgentInputItem } from "@openai/agents";

type AgentMemoryManager = {
  /**
   * Retrieves the agent's history from memory.
   * @returns A promise that resolves to an array of AgentInputItem objects representing the agent's history.
   * If no history is found, it returns an empty array.
   */
  getHistory: () => Promise<AgentInputItem[]>;
  /**
   * Retrieves the agent's state from memory.
   * @returns A promise that resolves to a string representing the agent's state.
   * If no state is found, it returns undefined.
   */
  getState: () => Promise<string | undefined>;
  /**
   * Updates the agent's memory with the provided history and state.
   * @param history - An array of AgentInputItem objects representing the agent's history.
   * @param state - A record containing the agent's state.
   * @returns A promise that resolves when the memory is successfully updated.
   */
  updateMemory: (
    history: AgentInputItem[],
    state: Record<string, unknown>,
  ) => Promise<void>;
};

export { AgentMemoryManager };
