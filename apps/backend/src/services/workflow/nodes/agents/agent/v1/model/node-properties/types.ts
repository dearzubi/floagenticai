import { NodeProperty } from "common";
import { ModelProviderNames } from "../types.js";

export type ModelProviderNodeProperties = {
  name: ModelProviderNames;
  label: string;
  icon: string;
  modelSettings: NodeProperty[];
};
