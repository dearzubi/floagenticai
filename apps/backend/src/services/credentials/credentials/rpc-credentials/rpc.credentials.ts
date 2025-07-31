import { INodeCredential, NodePropertyOption } from "common";
import { providers } from "./schemas.js";
import { RPCProviders } from "../../../blockchain/rpc/types.js";

export class RPCCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "rpc_credentials";
    this.label = "RPC Credentials";
    this.icon = "blockchain-logo.svg";
    this.properties = [
      {
        label: "Provider",
        name: "rpc_provider",
        type: "options",
        options: [
          ...Array.from(providers.entries()).map(([name, label]) => {
            return {
              name,
              label,
            } satisfies NodePropertyOption;
          }),
        ],
        default: "alchemy" as RPCProviders,
      },
      {
        label: "API Key",
        name: "api_key",
        type: "password",
        description:
          "Your API key for the provider you selected. May also be called token or secret key.",
      },
      {
        label: "Endpoint Name (QuickNode Only)",
        name: "quicknode_endpoint_name",
        type: "string",
        description:
          "The name of the endpoint you want to use. Only required for QuickNode. Leave it blank for other providers. E.g. COMPATIBLE-SPECIAL-GLADE",
        optional: true,
        default: "",
      },
    ];
  }
}
