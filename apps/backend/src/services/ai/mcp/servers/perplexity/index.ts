import { IMCPServer, MCPInitServerCtx } from "../../types.js";
import { MCPServer, MCPServerStdio } from "@openai/agents";
import { MCPServerCredentialNames } from "common";
import { validateCredential } from "../../../../credentials/crud/util.js";
import {
  PerplexityCredentials,
  perplexityCredentialsSchema,
} from "../../../../credentials/credentials/perplexity-credentials/schemas.js";

export class PerplexityMCPServer implements IMCPServer {
  description = {
    name: "perplexity",
    label: "Perplexity",
    description:
      "Connect Perplexity API to enable unparalleled real-time, web-wide research.\n",
    icon: "perplexity-logo.svg",
    category: "Web Search" as const,
    tools: ["perplexity_ask", "perplexity_research", "perplexity_reason"],
    credential: "perplexity_credentials" satisfies MCPServerCredentialNames,
  };

  async initServer(ctx: MCPInitServerCtx): Promise<MCPServer> {
    const credential = validateCredential<PerplexityCredentials>({
      credential: ctx.credential,
      schema: perplexityCredentialsSchema,
    });

    const mcpServer = new MCPServerStdio({
      name: this.description.description,
      fullCommand: "npx -y @chatmcp/server-perplexity-ask",
      env: {
        PERPLEXITY_API_KEY: credential.data.api_key,
      },
    });
    await mcpServer.connect();
    return mcpServer;
  }
}
