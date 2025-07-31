import { NodeCategories, NodeNames } from "common";
import { IBaseNode } from "./types.js";
import { AgentNode } from "./agents/agent/agent.node.js";
import { RouterAgentNode } from "./agents/router-agent/router-agent.node.js";
import { ManualTriggerNode } from "./triggers/manual/manual.trigger.node.js";
import { logger } from "../../../../utils/logger/index.js";
import { ChatTriggerNode } from "./triggers/chat/chat.trigger.node.js";
import { OneInchAgentNode } from "./agents/one-inch-agent/one-inch-agent.node.js";

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
    one_inch_agent: new OneInchAgentNode(),
  },
  Triggers: {
    manual_trigger: new ManualTriggerNode(),
    chat_trigger: new ChatTriggerNode(),
  },
};

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
