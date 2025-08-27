import { IMCPServer, MCPInitServerCtx } from "../../types.js";
import { MCPServer, MCPServerStdio } from "@openai/agents";
import { MCPServerCredentialNames } from "common";
import { validateCredential } from "../../../../credentials/crud/util.js";
import {
  GoogleMapsCredentials,
  googleMapsCredentialsSchema,
} from "../../../../credentials/credentials/google-maps-credentials/schemas.js";

export class GoogleMapsMCPServer implements IMCPServer {
  description = {
    name: "google_maps",
    label: "Google Maps",
    description:
      "Get access to location services, directions, and place details using Google Maps API.",
    icon: "google-maps-logo.svg",
    category: "Location" as const,
    tools: [
      "maps_geocode",
      "maps_reverse_geocode",
      "maps_search_places",
      "maps_place_details",
      "maps_distance_matrix",
      "maps_elevation",
      "maps_directions",
    ],
    credential: "google_maps_credentials" satisfies MCPServerCredentialNames,
  };

  async initServer(ctx: MCPInitServerCtx): Promise<MCPServer> {
    const credential = validateCredential<GoogleMapsCredentials>({
      credential: ctx.credential,
      schema: googleMapsCredentialsSchema,
    });

    const mcpServer = new MCPServerStdio({
      name: this.description.description,
      fullCommand: "npx -y @modelcontextprotocol/server-google-maps",
      env: {
        GOOGLE_MAPS_API_KEY: credential.data.api_key,
      },
    });
    await mcpServer.connect();
    return mcpServer;
  }
}
