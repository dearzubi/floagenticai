import { NodeBaseDescription } from "common";
import { BaseNode } from "../../base.node.js";
import { IBaseNode } from "../../../types.js";
import { ChatV1TriggerNode } from "./v1/chat.v1.trigger.node.js";

export class ChatTriggerNode extends BaseNode {
  constructor() {
    const baseDescription: NodeBaseDescription = {
      label: "Chat Trigger",
      name: "chat_trigger",
      icon: undefined,
      category: "Triggers",
      description: "Run a workflow by chatting.",
      defaultVersion: 1,
      trigger: true,
    };

    const nodeVersions: IBaseNode["nodeVersions"] = {
      1: new ChatV1TriggerNode(),
    };

    super(nodeVersions, baseDescription);
  }
}
