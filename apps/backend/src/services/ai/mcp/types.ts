import { MCPServerDescription } from "common";
import { MCPServer } from "@openai/agents";

export interface IMCPServer {
  description: MCPServerDescription;
  initServer(): Promise<MCPServer>;
}
