import { NodeBaseDescription } from "common";
import { BaseNode } from "../../base.node.js";
import { IBaseNode } from "../../../types.js";
import { AgentV1Node } from "./v1/agent.v1.node.js";

export class AgentNode extends BaseNode {
  constructor() {
    const baseDescription: NodeBaseDescription = {
      label: "Agent",
      name: "agent",
      icon: undefined,
      category: "Agents",
      description: "General-purpose AI agent for various tasks.",
      defaultVersion: 1,
    };

    const nodeVersions: IBaseNode["nodeVersions"] = {
      1: new AgentV1Node(),
    };

    super(nodeVersions, baseDescription);
  }
}
