import { IMCPServer, MCPInitServerCtx } from "../../types.js";
import { MCPServer, MCPServerStdio } from "@openai/agents";
import { MCPServerCredentialNames } from "common";
import { validateCredential } from "../../../../credentials/crud/util.js";
import {
  BraveCredentials,
  braveCredentialsSchema,
} from "../../../../credentials/credentials/brave-credentials/schemas.js";

export class BraveSearchMCPServer implements IMCPServer {
  description = {
    name: "brave_search",
    label: "Brave Search",
    description:
      "Provide LLMs with both web and local search capabilities using Brave Search API.",
    icon: "brave-logo.svg",
    category: "Web Search" as const,
    tools: ["brave_web_search", "brave_local_search"],
    credential: "brave_credentials" satisfies MCPServerCredentialNames,
  };

  async initServer(ctx: MCPInitServerCtx): Promise<MCPServer> {
    const credential = validateCredential<BraveCredentials>({
      credential: ctx.credential,
      schema: braveCredentialsSchema,
    });

    const mcpServer = new MCPServerStdio({
      name: this.description.description,
      fullCommand: "npx -y @modelcontextprotocol/server-brave-search",
      env: {
        BRAVE_API_KEY: credential.data.api_key,
      },
    });
    await mcpServer.connect();
    return mcpServer;
  }
}
