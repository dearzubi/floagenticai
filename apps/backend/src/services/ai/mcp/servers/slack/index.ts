import { IMCPServer } from "../../types.js";
import { MCPServer, MCPServerStreamableHttp } from "@openai/agents";

export class SlackMCPServer implements IMCPServer {
  description = {
    name: "slack",
    label: "Slack",
    description: "Send messages, manage channels, and interact with Slack workspaces for team communication",
    icon: "slack-logo.svg",
    category: "Communication" as const,
    tools: ["send_message", "list_channels", "create_channel", "get_user_info", "upload_file", "search_messages"],
  };

  async initServer(): Promise<MCPServer> {
    const mcpServer = new MCPServerStreamableHttp({
      url: "https://slack.com/api/mcp",
      name: "Slack MCP Server",
    });
    return Promise.resolve(mcpServer);
  }
}
