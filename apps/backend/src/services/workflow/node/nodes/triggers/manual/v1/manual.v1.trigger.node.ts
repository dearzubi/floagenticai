import {
  INodeVersion,
  NodeExecutionInput,
  NodeExecutionOutput,
} from "../../../../types.js";
import { NodeVersionDescription } from "common";

export class ManualV1TriggerNode implements INodeVersion {
  description: NodeVersionDescription;

  constructor() {
    this.description = {
      version: 1,
      properties: [],
    };
  }

  async execute({ id }: NodeExecutionInput): Promise<NodeExecutionOutput> {
    return {
      nodeId: id,
      success: true,
      outputs: {},
    } satisfies NodeExecutionOutput;
  }
}
