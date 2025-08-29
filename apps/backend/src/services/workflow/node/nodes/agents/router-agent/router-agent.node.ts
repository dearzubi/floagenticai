import { BaseNode } from "../../base.node.js";
import { NodeBaseDescription } from "common";
import { RouterAgentV1Node } from "./v1/router-agent.v1.node.js";
import { IBaseNode } from "../../../types.js";

export class RouterAgentNode extends BaseNode {
  constructor() {
    const baseDescription: NodeBaseDescription = {
      label: "Router Agent",
      name: "router_agent",
      icon: "fa:route",
      category: "Agents",
      description:
        "Routes workflow execution to different paths based on conditions.",
      defaultVersion: 1,
    };

    const nodeVersions: IBaseNode["nodeVersions"] = {
      1: new RouterAgentV1Node(),
    };

    super(nodeVersions, baseDescription);
  }
}
