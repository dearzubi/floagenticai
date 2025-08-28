import { DB } from "../../../../database/init.js";
import { AgentInputItem } from "@openai/agents";
import { AgentMemory } from "../../../../database/entities/agent-memory.entity.js";
import { decryptData, encryptData } from "../../../../utils/encryption.js";
import { safeParseJSON } from "common";
import { AgentMemoryManager } from "./types.js";

/**
 * Get Agent history from database memory for a workflow node
 * @param sessionId - A unique identifier for the session
 * @param workflowId - The ID of the workflow
 * @param nodeId - The ID of the nodes
 * @param db - The database instance
 * @returns A promise that resolves to an array of AgentInputItem objects representing the agent's
 */
const getAgentHistoryForNode = async ({
  sessionId,
  workflowId,
  nodeId,
  db,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
  db: DB;
}): Promise<AgentInputItem[]> => {
  const dbMemory = await db.findOne(AgentMemory, {
    workflowId,
    nodeId,
    sessionId,
  });

  const decryptedData = decryptData(dbMemory?.history);

  return (
    safeParseJSON<AgentInputItem[]>(
      decryptedData.ok ? decryptedData.plainText : "[]",
    ) || []
  );
};

/**
 * Get Agent state from database memory for a workflow node
 * @param sessionId - A unique identifier for the session
 * @param workflowId - The ID of the workflow
 * @param nodeId - The ID of the nodes
 * @param db - The database instance
 */
const getAgentStateForNode = async ({
  sessionId,
  workflowId,
  nodeId,
  db,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
  db: DB;
}): Promise<string | undefined> => {
  const dbMemory = await db.findOne(AgentMemory, {
    workflowId,
    nodeId,
    sessionId,
  });

  const decryptedData = decryptData(dbMemory?.state);

  return decryptedData?.ok ? decryptedData.plainText : undefined;
};

/**
 * Update Agent memory in database for a workflow node
 * @param sessionId - A unique identifier for the session
 * @param workflowId - The ID of the workflow
 * @param nodeId - The ID of the nodes
 * @param history - The updated history of the agent
 * @param state - The updated state of the agent
 * @param db - The database instance
 */
const updateAgentMemoryForNode = async ({
  sessionId,
  workflowId,
  nodeId,
  history,
  state,
  db,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
  history: AgentInputItem[];
  state: Record<string, unknown>;
  db: DB;
}): Promise<void> => {
  const memory = db.create(AgentMemory, {
    sessionId,
    workflowId,
    nodeId,
    history: encryptData(JSON.stringify(history)),
    state: encryptData(JSON.stringify(state)),
  });

  await db.upsert(AgentMemory, memory);

  await db.flush();
};

/**
 * Creates an AgentMemoryManager for a specific workflow node.
 * @param sessionId
 * @param workflowId
 * @param nodeId
 * @param db
 */
const creatNodeAgentMemoryManager = ({
  sessionId,
  workflowId,
  nodeId,
  db,
}: {
  sessionId: string;
  workflowId: string;
  nodeId: string;
  db: DB;
}): AgentMemoryManager => {
  return {
    getHistory: () =>
      getAgentHistoryForNode({ sessionId, workflowId, nodeId, db }),
    getState: () => getAgentStateForNode({ sessionId, workflowId, nodeId, db }),
    updateMemory: (history: AgentInputItem[], state: Record<string, unknown>) =>
      updateAgentMemoryForNode({
        sessionId,
        workflowId,
        nodeId,
        history,
        state,
        db,
      }),
  };
};

export { creatNodeAgentMemoryManager };
