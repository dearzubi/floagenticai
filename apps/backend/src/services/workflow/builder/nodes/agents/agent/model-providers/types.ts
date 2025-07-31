import { NodeProperty } from "common";

export interface ModelProvider {
  name: "google_gen_ai" | "openai";
  label: string;
  icon: string;
  modelSettings: NodeProperty[];
}
