import { createFileRoute } from "@tanstack/react-router";
import MCPServersPage from "../../components/pages/mcp-servers/index.tsx";

export const Route = createFileRoute("/_dashboard/mcp-servers")({
  component: MCPServersPage,
});
