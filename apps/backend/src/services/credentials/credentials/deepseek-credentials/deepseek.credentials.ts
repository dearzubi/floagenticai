import { INodeCredential } from "common";

export class DeepseekCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "deepseek";
    this.label = "DeepSeek Credentials";
    this.icon = "deepseek-logo.svg";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
