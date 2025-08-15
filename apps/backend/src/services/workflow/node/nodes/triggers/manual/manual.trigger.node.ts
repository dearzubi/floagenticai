import { NodeBaseDescription } from "common";
import { BaseNode } from "../../base.node.js";
import { IBaseNode } from "../../../types.js";
import { ManualV1TriggerNode } from "./v1/manual.v1.trigger.node.js";

export class ManualTriggerNode extends BaseNode {
  constructor() {
    const baseDescription: NodeBaseDescription = {
      label: "Manual Trigger",
      name: "manual_trigger",
      icon: undefined,
      category: "Triggers",
      description: "Run a workflow manually by clicking the button in the UI.",
      defaultVersion: 1,
      trigger: true,
    };

    const nodeVersions: IBaseNode["nodeVersions"] = {
      1: new ManualV1TriggerNode(),
    };

    super(nodeVersions, baseDescription);
  }
}
