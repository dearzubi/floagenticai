import { IMCPServer } from "../../types.js";
import { MCPServer, MCPServerStreamableHttp } from "@openai/agents";

export class PostgreSQLMCPServer implements IMCPServer {
  description = {
    name: "postgresql",
    label: "PostgreSQL",
    description: "Connect to PostgreSQL databases, execute queries, manage schemas, and perform database operations",
    icon: "postgresql-logo.svg",
    category: "Database" as const,
    tools: ["execute_query", "list_tables", "describe_table", "create_table", "insert_data", "update_data", "delete_data", "backup_database"],
  };

  async initServer(): Promise<MCPServer> {
    const mcpServer = new MCPServerStreamableHttp({
      url: "https://postgres.mcp.local/api",
      name: "PostgreSQL MCP Server",
    });
    return Promise.resolve(mcpServer);
  }
}
