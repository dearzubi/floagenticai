import { INodeCredential } from "common";

export class PerplexityCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "perplexity_credentials";
    this.label = "Perplexity Credentials";
    this.icon = "perplexity-logo.svg";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
