import { IMCPServer } from "../../types.js";
import { MCPServer, MCPServerStreamableHttp } from "@openai/agents";
import { MCPServerCredentialNames } from "common";

export class LinkupMCPServer implements IMCPServer {
  description = {
    name: "linkup",
    label: "LinkUp",
    description:
      "Connect your model to live web data via Linkup for real-time accuracy.",
    icon: "linkup-logo.svg",
    category: "Web Search" as const,
    tools: ["search"],
    credential: "linkup_credentials" satisfies MCPServerCredentialNames,
  };

  async initServer(): Promise<MCPServer> {
    const mcpServer = new MCPServerStreamableHttp({
      url: "https://gitmcp.io/openai/codex",
      name: "GitMCP Documentation Server",
    });
    return Promise.resolve(mcpServer);
  }
}
