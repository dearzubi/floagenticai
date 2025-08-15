import { NodeProperty, ModelProviders } from "common";

export type ModelProviderProperties = {
  name: ModelProviders;
  label: string;
  icon: string;
  modelSettings: NodeProperty[];
};
