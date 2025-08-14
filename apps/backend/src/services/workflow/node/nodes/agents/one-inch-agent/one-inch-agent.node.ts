import { BaseNode } from "../../base.node.js";
import { NodeBaseDescription } from "common";
import { OneInchAgentV1Node } from "./v1/one-inch-agent.v1.node.js";
import { IBaseNode } from "../../../types.js";

export class OneInchAgentNode extends BaseNode {
  constructor() {
    const baseDescription: NodeBaseDescription = {
      label: "1Inch Agent",
      name: "one_inch_agent",
      icon: "one-inch-logo.png",
      category: "Agents",
      description:
        "Interacts with the 1Inch DEX to perform token swaps and queries.",
      defaultVersion: 1,
    };

    const nodeVersions: IBaseNode["nodeVersions"] = {
      1: new OneInchAgentV1Node(),
    };

    super(nodeVersions, baseDescription);
  }
}
