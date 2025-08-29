import { NodeCategories, NodeNames } from "common";
import { IBaseNode } from "./types.js";
import { AgentNode } from "./nodes/agents/agent/agent.node.js";
import { RouterAgentNode } from "./nodes/agents/router-agent/router-agent.node.js";
import { logger } from "../../../utils/logger/index.js";
import { ChatTriggerNode } from "./nodes/triggers/chat/chat.trigger.node.js";

/**
 * Represents a collection of all available workflow nodes categorized by their respective categories.
 */
export const workflowNodes: Record<
  NodeCategories,
  Partial<Record<NodeNames, IBaseNode>>
> = {
  Agents: {
    agent: new AgentNode(),
    router_agent: new RouterAgentNode(),
    // one_inch_agent: new OneInchAgentNode(), //TODO: Will get back to OneInchAgentNode later
  },
  Triggers: {
    // manual_trigger: new ManualTriggerNode(), TODO: Will get back to ManualTriggerNode later
    chat_trigger: new ChatTriggerNode(),
  },
};

export const workflowNodesMap = new Map<NodeNames, IBaseNode>(
  Object.entries(workflowNodes).flatMap(([_category, categoryNodes]) =>
    Object.entries(categoryNodes).map(([nodeName, nodeInstance]) => [
      nodeName as NodeNames,
      nodeInstance,
    ]),
  ),
);

const nodeCounts = Object.entries(workflowNodes).reduce(
  (acc, [category, categoryNodes]) => {
    acc[category] = Object.keys(categoryNodes).length;
    return acc;
  },
  {} as Record<string, number>,
);

logger.info("Workflow nodes initialised: ", {
  categories: nodeCounts,
  totalNodes: Object.values(nodeCounts).reduce((sum, count) => sum + count, 0),
});
