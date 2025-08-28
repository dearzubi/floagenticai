import { INodeCredential } from "common";

export class BraveCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "brave_credentials";
    this.label = "Brave Search Credentials";
    this.icon = "brave-logo.svg";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
