import { IMCPServer, MCPInitServerCtx } from "../../types.js";
import { MCPServer, MCPServerStdio } from "@openai/agents";
import { MCPServerCredentialNames } from "common";
import { validateCredential } from "../../../../credentials/crud/util.js";
import {
  LinkupCredentials,
  linkupCredentialsSchema,
} from "../../../../credentials/credentials/linkup-credentials/schemas.js";

export class LinkupMCPServer implements IMCPServer {
  description = {
    name: "linkup",
    label: "LinkUp",
    description:
      "Connect your model to live web data via Linkup for real-time accuracy.",
    icon: "linkup-logo.svg",
    category: "Web Search" as const,
    tools: ["search-web"],
    credential: "linkup_credentials" satisfies MCPServerCredentialNames,
  };

  async initServer(ctx: MCPInitServerCtx): Promise<MCPServer> {
    const credential = validateCredential<LinkupCredentials>({
      credential: ctx.credential,
      schema: linkupCredentialsSchema,
    });

    const mcpServer = new MCPServerStdio({
      name: this.description.description,
      fullCommand: `npx -y linkup-mcp-server --api-key=${credential.data.api_key}`,
    });
    await mcpServer.connect();
    return mcpServer;
  }
}
