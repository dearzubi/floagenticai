import { INodeCredential } from "common";

export class GoogleAICredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "google_gen_ai";
    this.label = "GoogleAI Credentials";
    this.icon = "gemini-logo.svg";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
