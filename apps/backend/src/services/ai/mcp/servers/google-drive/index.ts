import { IMCPServer } from "../../types.js";
import { MCPServer, MCPServerStreamableHttp } from "@openai/agents";

export class GoogleDriveMCPServer implements IMCPServer {
  description = {
    name: "google-drive",
    label: "Google Drive",
    description: "Access and manage Google Drive files, folders, and sharing permissions for cloud storage operations",
    icon: "google-drive-logo.svg",
    category: "Cloud Storage" as const,
    tools: ["list_files", "upload_file", "download_file", "create_folder", "delete_file", "share_file", "search_files", "get_file_metadata"],
  };

  async initServer(): Promise<MCPServer> {
    const mcpServer = new MCPServerStreamableHttp({
      url: "https://drive.googleapis.com/mcp",
      name: "Google Drive MCP Server",
    });
    return Promise.resolve(mcpServer);
  }
}
