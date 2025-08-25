import { IMCPServer } from "../types.js";
import { LinkupMCPServer } from "./linkup/index.js";
import { GitHubMCPServer } from "./github/index.js";
import { SlackMCPServer } from "./slack/index.js";
import { PostgreSQLMCPServer } from "./postgres/index.js";
import { GoogleDriveMCPServer } from "./google-drive/index.js";

export const mcpServers = new Map<string, IMCPServer>()
  .set("linkup", new LinkupMCPServer())
  .set("github", new GitHubMCPServer())
  .set("slack", new SlackMCPServer())
  .set("postgresql", new PostgreSQLMCPServer())
  .set("google-drive", new GoogleDriveMCPServer());
