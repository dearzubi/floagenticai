import { IMCPServer, MCPInitServerCtx } from "../../types.js";
import { MCPServer, MCPServerStdio } from "@openai/agents";
import { MCPServerCredentialNames } from "common";
import { validateCredential } from "../../../../credentials/crud/util.js";
import {
  EverArtCredentials,
  everartCredentialsSchema,
} from "../../../../credentials/credentials/everart-credentials/schemas.js";

export class EvertArtMCPServer implements IMCPServer {
  description = {
    name: "everart",
    label: "EvertArt",
    description:
      "Generate images from text prompts using the EvertArt API. Supported models: FLUX1.1 (standard), FLUX1.1-ultra, SD3.5, Recraft-Real, Recraft-Vector.",
    icon: "everart-logo.png",
    category: "Image Generation" as const,
    tools: ["generate_image"],
    credential: "everart_credentials" satisfies MCPServerCredentialNames,
  };

  async initServer(ctx: MCPInitServerCtx): Promise<MCPServer> {
    const credential = validateCredential<EverArtCredentials>({
      credential: ctx.credential,
      schema: everartCredentialsSchema,
    });

    const mcpServer = new MCPServerStdio({
      name: this.description.description,
      fullCommand: "npx -y @modelcontextprotocol/server-everart",
      env: {
        EVERART_API_KEY: credential.data.api_key,
      },
    });
    await mcpServer.connect();
    return mcpServer;
  }
}
