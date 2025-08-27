import { IMCPServer } from "../types.js";
import { LinkupMCPServer } from "./linkup/index.js";
import { TimeMCPServer } from "./time/index.js";
import { PerplexityMCPServer } from "./perplexity/index.js";
import { EvertArtMCPServer } from "./everart/index.js";

export const mcpServers = new Map<string, IMCPServer>()
  .set("linkup", new LinkupMCPServer())
  .set("time", new TimeMCPServer())
  .set("perplexity", new PerplexityMCPServer())
  .set("everart", new EvertArtMCPServer());
