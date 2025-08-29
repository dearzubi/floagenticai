import { MCPServerDescription } from "common";
import { MCPServer, MCPToolFilterStatic } from "@openai/agents";
import { CredentialData } from "../../credentials/crud/types.js";

export type MCPInitServerCtx = {
  credential?: CredentialData;
  toolFilter?: MCPToolFilterStatic;
};

export interface IMCPServer {
  description: MCPServerDescription;
  initServer(ctx?: MCPInitServerCtx): Promise<MCPServer>;
}
