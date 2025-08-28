import { IMCPServer } from "../../types.js";
import { MCPServer, MCPServerStreamableHttp } from "@openai/agents";

export class GitHubMCPServer implements IMCPServer {
  description = {
    name: "github",
    label: "GitHub",
    description: "Access GitHub repositories, issues, pull requests, and manage code collaboration workflows",
    icon: "github-logo.svg",
    category: "Development Tools" as const,
    tools: ["search_repositories", "get_repository", "list_issues", "create_issue", "get_pull_requests", "create_pull_request"],
  };

  async initServer(): Promise<MCPServer> {
    const mcpServer = new MCPServerStreamableHttp({
      url: "https://api.github.com/mcp",
      name: "GitHub MCP Server",
    });
    return Promise.resolve(mcpServer);
  }
}
