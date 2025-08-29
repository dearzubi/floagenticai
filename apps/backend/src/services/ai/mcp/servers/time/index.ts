import { IMCPServer, MCPInitServerCtx } from "../../types.js";
import { MCPServer, MCPServerStdio } from "@openai/agents";

export class TimeMCPServer implements IMCPServer {
  description = {
    name: "time",
    label: "Time",
    description:
      "Enable LLMs to get current time information and perform timezone conversions using IANA timezone names, with automatic system timezone detection.",
    icon: "time-mcp-logo.svg",
    category: "Date and Time" as const,
    tools: ["get_current_time", "convert_time"],
  };

  async initServer(_ctx: MCPInitServerCtx): Promise<MCPServer> {
    const mcpServer = new MCPServerStdio({
      name: this.description.description,
      fullCommand: "uvx mcp-server-time",
    });
    await mcpServer.connect();
    return mcpServer;
  }
}
